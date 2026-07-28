// Category filter for the portfolio grid. Pills carry data-filter; each card
// carries a pipe-delimited data-categories. Clicking a pill marks it active and
// fades non-matching cards out, then removes them from the grid layout so the
// remaining cards reflow. Purely presentational — the cards and their data-index
// (used by the modal) are untouched.

const grid = document.querySelector('[data-portfolio-grid]');
const pills = Array.from(document.querySelectorAll('.filter-pill'));

if (grid && pills.length) {
  const cards = Array.from(grid.querySelectorAll('.portfolio-card'));
  const FADE_MS = 350; // keep in sync with the .portfolio-card opacity transition

  function cardMatches(card, filter) {
    if (filter === 'all') return true;
    const cats = (card.dataset.categories || '').split('|').filter(Boolean);
    return cats.includes(filter);
  }

  function applyFilter(filter) {
    cards.forEach((card) => {
      if (cardMatches(card, filter)) {
        // Reveal: drop the hidden attribute first, then fade in next frame.
        card.hidden = false;
        requestAnimationFrame(() => card.classList.remove('filtered-out'));
      } else {
        // Fade out, then pull it from the layout once the transition ends so
        // the grid reflows. The class guard makes rapid switches safe.
        card.classList.add('filtered-out');
        window.setTimeout(() => {
          if (card.classList.contains('filtered-out')) card.hidden = true;
        }, FADE_MS);
      }
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) return;
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilter(pill.dataset.filter || 'all');
    });
  });
}
