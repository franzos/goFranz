---
title: "Rust and React: Tips for Full-Stack Development"
summary: "How to stay productive with Rust and React using Typeshare, Garde and Mantine."
layout: blog
source:
date: 2025-07-20 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - rust
  - typescript
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

In the past two years, I’ve spent more time developing APIs in Rust than in TypeScript. On the frontend, I usually stick to React with Mantine components—a combination that’s both productive and reliable. Here are a few tips to help you tighten your stack and workflow:

### Shared TypeScript Types

One of the first things you're going to want to add is [typeshare](https://crates.io/crates/typeshare). This crate makes it easy to generate TypeScript types from your Rust structs.

```toml
typeshare = "1.0"
```

Here's a minimal example:

```rust
#[typeshare]
pub struct NewDiscount {
    pub title: String,
    #[typeshare(serialized_as = "string")] // The frontend receives this as string, so this works well
    pub start_date: chrono::DateTime<Utc>,
}
```

It's really painless:

```bash
typeshare . --lang=typescript --output-file=/frontend/common/src/types/generated.ts --config-file=typeshare.toml
```

### OpenAPI

Sometimes it’s much easier to look up endpoint definitions via Swagger, so start adding OpenAPI and Swagger endpoints as early as possible, especially if you have collaborators. I use [utoipa](https://crates.io/crates/utoipa) and [utoipa-swagger-ui](https://crates.io/crates/utoipa-swagger-ui) to generate the OpenAPI documentation and serve it via Swagger UI.

```toml
utoipa = { version = "5.4", features = ["actix_extras", "chrono", "uuid", "decimal"] }
utoipa-swagger-ui = { version = "9.0", features = ["actix-web"] }
```

It's quite verbose, but mandatory unless you expect everyone to open up the source code:

```rust
#[utoipa::path(
    post,
    path = "/v1/a/shops/{shop_id}/discounts",
    params(
        ("shop_id" = String, Path, description = "Shop ID")
    ),
    request_body = NewDiscount,
    responses(
        (status = 201, description = "Discount created successfully", body = Discount),
        (status = 401, description = "Unauthorized - invalid or missing auth token"),
        (status = 403, description = "Forbidden - no access to shop"),
        (status = 500, description = "Internal server error")
    ),
    tag = "discounts",
    security(
        ("bearer_auth" = [])
    )
)]
#[post("/shops/{shop_id}/discounts")]
pub async fn create_discount(...)
```

### Input Validation

To validate user input, I use [garde](https://crates.io/crates/garde) with the `actix-web-validation` crate. This allows you to define validation rules for your API endpoints in a clean and concise way.

```toml
# Content Validation
garde = { version = "0.22", features = ["derive", "url", "email"] }
actix-web-validation = { version = "0.8", features = ["garde"] }
url = "2.5.4"
regex = "1.11.1"
once_cell = "1.21.3"
derive_more = "2.0.1"
```

Additionally, to obtain more detailed deserialization errors:

```toml
# Type Validation
serde_path_to_error = "0.1"
```

Here's a more complete example with Typeshare, OpenAPI and Serde and Garde validation:

```rust
#[typeshare]
#[derive(Serialize, Deserialize, ToSchema, Validate)]
#[garde(allow_unvalidated)]
pub struct NewDiscount {
    #[garde(length(min = 10))]
    pub title: String, // If this title is not at least 10 characters long, a content validation error is triggered
    #[garde(length(min = 30))]
    pub description: Option<String>,
    #[garde(dive)]
    pub config: Option<DiscountConfig>,
    #[typeshare(serialized_as = "string")]
    pub start_date: chrono::DateTime<Utc>,
    #[typeshare(serialized_as = "string")]
    pub end_date: chrono::DateTime<Utc>, // If this is not a valid date with timezone, a type validation error is triggered
}

#[post("/v1/a/shops/{shop_id}/discounts")]
pub async fn create_discount(
    glob: web::Data<GlobalState>,
    claims: Option<web::ReqData<AuthTokenClaims>>,
    shop_id: web::Path<Uuid>,
    Validated(data): Validated<PathAwareJson<NewDiscount>>, // First type, then field content validation
) -> actix_web::Result<impl Responder> {
    // Save in database

    Ok(HttpResponse::Created().json(discount))
}
```

Here's how it's wired-up:

```rust
App::new()
    // other things ...
    .configure(openapi::configure_swagger)
    .garde_error_handler(Arc::new(garde_error_handler))
```

#### Content Validation

`Validated` is used to validate the contents of the fields in your structs. This is where you can define rules like minimum lengths, email formats, and so on.

```rust
use actix_web::HttpRequest;
use crate::actix_errors::{FieldValidationError, FieldValidationErrorResponse};

pub fn garde_error_handler(errors: garde::Report, _: &HttpRequest) -> actix_web::Error {
    let field_errors: Vec<FieldValidationError> = errors
        .iter()
        .map(|(path, error)| {
            let field = path.to_string();
            let error_string = error.to_string();
            
            // Extract code from error string (garde errors typically contain the validation rule)
            let code = if error_string.contains("length") {
                "length".to_string()
            } else if error_string.contains("email") {
                "email".to_string()
            } else if error_string.contains("range") {
                "range".to_string()
            } else {
                "validation".to_string()
            };
            
            let message = format!("Validation failed for field '{}': {}", field, error_string);
            
            // Extract parameters from error string if possible
            let params = if code == "length" {
                // Try to extract min/max from error message
                serde_json::json!({})
            } else {
                serde_json::json!({})
            };

            FieldValidationError {
                field,
                code,
                message,
                params,
            }
        })
        .collect();

    FieldValidationErrorResponse::new(field_errors).into()
}
```

#### Type Validation

The JSON validation is handled by `PathAwareJson` which makes sure types are correct (boolean, dates, lists, etc.) and that the data is deserialized correctly. If there's an error, it will return a `FieldValidationErrorResponse` with detailed information about the validation errors.

```rust
use actix_web::{web, FromRequest, HttpRequest, dev::Payload};
use futures_util::future::LocalBoxFuture;
use serde::de::DeserializeOwned;
use std::fmt;
use crate::actix_errors::{FieldValidationError, FieldValidationErrorResponse};

pub struct PathAwareJson<T>(pub T);

impl<T> fmt::Debug for PathAwareJson<T>
where
    T: fmt::Debug,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "PathAwareJson: {:?}", self.0)
    }
}

impl<T> PathAwareJson<T> {
    /// Deconstruct to an inner value
    pub fn into_inner(self) -> T {
        self.0
    }
}

impl<T> std::ops::Deref for PathAwareJson<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

impl<T> std::ops::DerefMut for PathAwareJson<T> {
    fn deref_mut(&mut self) -> &mut T {
        &mut self.0
    }
}

impl<T> FromRequest for PathAwareJson<T>
where
    T: DeserializeOwned + 'static,
{
    type Error = actix_web::Error;
    type Future = LocalBoxFuture<'static, Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let _config = req.app_data::<web::JsonConfig>().cloned().unwrap_or_default();
        
        // Extract the payload asynchronously
        let fut = web::Bytes::from_request(req, payload);
        
        Box::pin(async move {
            match fut.await {
                Ok(bytes) => {
                    // Use serde_path_to_error for detailed error information
                    let mut deserializer = serde_json::Deserializer::from_slice(&bytes);
                    match serde_path_to_error::deserialize::<_, T>(&mut deserializer) {
                        Ok(value) => Ok(PathAwareJson(value)),
                        Err(err) => {
                            let path = err.path().to_string();
                            let inner_error = err.into_inner();
                            
                            // Extract field name from path (remove leading dots)
                            let field = if path.is_empty() {
                                "root".to_string()
                            } else {
                                path.trim_start_matches('.').to_string()
                            };
                            
                            // Classify the error type
                            let error_msg = inner_error.to_string();
                            let code = classify_serde_error(&error_msg);
                            let message = format!("Field '{}': {}", field, error_msg);
                            
                            let field_error = FieldValidationError {
                                field: field.clone(),
                                code,
                                message,
                                params: serde_json::json!({
                                    "path": path
                                }),
                            };

                            let custom_error = FieldValidationErrorResponse::new( vec![field_error]);
                            Err(custom_error.into())
                        }
                    }
                }
                Err(err) => {
                    // Handle other payload-related errors
                    let field_error = FieldValidationError {
                        field: "payload".to_string(),
                        code: "payload_error".to_string(),
                        message: format!("Payload error: {}", err),
                        params: serde_json::json!({}),
                    };

                    let custom_error = FieldValidationErrorResponse::new(vec![field_error]);
                    Err(custom_error.into())
                }
            }
        })
    }
}

fn classify_serde_error(error_msg: &str) -> String {
    if error_msg.contains("invalid type") {
        "type_mismatch".to_string()
    } else if error_msg.contains("missing field") {
        "missing_field".to_string()
    } else if error_msg.contains("unknown field") {
        "unknown_field".to_string()
    } else if error_msg.contains("duplicate field") {
        "duplicate_field".to_string()
    } else if error_msg.contains("invalid length") {
        "invalid_length".to_string()
    } else if error_msg.contains("expected") {
        "format_error".to_string()
    } else {
        "parse_error".to_string()
    }
}
```

Here's what this looks like:

```json
{
  "error":"validation_error",
  "action":null,
  "message":"Validation failed for fields: allow_negative_stock",
  "errors":[
    {
      "field":"allow_negative_stock",
      "code":"type_mismatch",
      "message":"Field 'allow_negative_stock': invalid type: string \"not_a_boolean\", expected a boolean at line 1 column 92",
      "params":{"path":"allow_negative_stock"}
    }
  ]
}
```

These kind of errors are useful for 3rd parties working on your API; It's unlikely that a user submits a boolean form field as a string, for example.

### React Integration

Now it’s time to wire it all up. To summarize, we have:

- We have types, for example, `Discount`, `NewDiscount`, `UpdateDiscount`, etc.
- We have OpenAPI documentation for our endpoints for reference
- The API will complain, if the input is not valid

#### useForm with Mantine

On the frontend, we can now put these to work; In this example, I'll use `useForm` from Mantine to handle form state and validation.

Setup the form as usual:

```typescript
// Setup
const form = useForm({
    mode: 'controlled',
    initialValues: initialValues as Record<string, unknown>,
});

// Submit handler
const submitForm = async (data: typeof form.values) => {
    try {
      // Callback to the parent component or API call
      await submitFormCb(data);
    } catch (e) {
      // Handle form related errors
      if (hasFieldValidationError(e)) {
        form.setErrors(axiosFieldValidationErrorToFormErrors(e));
      }
    }
};
```

When we invoke `form.setErrors` with the errors from the API, the related form fields will be marked as invalid, and the error messages will be displayed below the respective fields.

#### Error Handling Logic

Here's what `hasFieldValidationError` and `axiosFieldValidationErrorToFormErrors` look like:

```typescript
import { AxiosError, AxiosResponse } from "axios"
import { FieldValidationErrorResponse, FieldValidationError } from "./generated" // these are from Typeshare

export interface AxiosFieldValidationErrorResponse extends AxiosError {
    response: AxiosResponse<FieldValidationErrorResponse, any>
}

export function hasFieldValidationError(error: any): error is AxiosFieldValidationErrorResponse {
    return Boolean(
        error?.isAxiosError &&
        error?.response?.data?.error === "validation_error"
    );
}

export function axiosFieldValidationErrorToFormErrors(
    validationError: AxiosFieldValidationErrorResponse
): Record<string, string> {
    const responseData = validationError.response?.data;

    if (responseData.error !== "validation_error") {
        return {};
    }

    const formErrors: Record<string, string> = {};

    responseData.errors.forEach((fieldError: FieldValidationError) => {
        if (fieldError.field && fieldError.message) {
            formErrors[fieldError.field] = fieldError.message;
        }
    });

    return formErrors;
}
```

That's it for now; If you follow these steps, you'll save a lot of time sharing types, validating input, and keeping collaborators happy.

## Conclusion

The reason I originally started working with TypeScript over ten years ago was because I could easily share types between the frontend and backend. Refactoring became a pleasure—breaking changes on one side are flagged on the other, giving me confidence that everything still fit together.

With Rust and Typeshare powering the backend and React on the frontend, I lose almost none of TypeScript’s benefits while gaining all of Rust’s strengths. Writing Rust isn’t as fast as writing TypeScript, but since my projects aren’t throwaway, I don’t mind the extra time for the long-term benefits.