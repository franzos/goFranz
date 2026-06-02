// Import Bootstrap JS components (only what you need)
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/modal'
import 'bootstrap/js/dist/offcanvas'

document.addEventListener('DOMContentLoaded', () => {
  initImageModal()
})

// Image modal functionality
function initImageModal() {
  const imageModal = document.getElementById('imageModal')
  if (!imageModal) return

  imageModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const imageSrc = button.getAttribute('data-image')
    const imageCaption = button.getAttribute('data-caption')

    const modalImage = document.getElementById('modalImage')

    if (modalImage && imageSrc) {
      modalImage.src = imageSrc
      modalImage.alt = imageCaption || ''
    }
  })
}

// Mark external links: open in a new tab and harden the rel attribute.
document.addEventListener('DOMContentLoaded', function () {
  var host = window.location.hostname
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (a.hostname && a.hostname !== host) {
      a.setAttribute('rel', 'noopener noreferrer nofollow')
      a.setAttribute('target', '_blank')
    }
  })
})

// Theme switching lives in the shared _includes/theme-script.html include,
// loaded inline on every page (main site and product pages alike).

// Recipe listing filter — progressive enhancement. With JS off, all cards
// show and the chips are inert.
document.addEventListener('DOMContentLoaded', function () {
  var bar = document.querySelector('[data-recipe-filters]');
  var grid = document.querySelector('[data-recipe-grid]');
  if (!bar || !grid) return;

  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('.sk-filter');
    if (!btn) return;
    var facet = btn.getAttribute('data-facet');

    bar.querySelectorAll('.sk-filter').forEach(function (b) {
      b.classList.toggle('on', b === btn);
    });

    grid.querySelectorAll('.sk-card').forEach(function (card) {
      var facets = (card.getAttribute('data-facets') || '').split('|');
      card.hidden = !(facet === 'all' || facets.indexOf(facet) !== -1);
    });
  });
});
