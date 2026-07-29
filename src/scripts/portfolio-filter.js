// Category filter for the grouped portfolio sections.
const sectionBlocks = Array.from(document.querySelectorAll('[data-category-group]'));
const pills = Array.from(document.querySelectorAll('.filter-pill'));

if (pills.length) {
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) return;
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter || 'all';

      if (sectionBlocks.length) {
        sectionBlocks.forEach((block) => {
          const groupName = block.dataset.categoryGroup;
          if (filter === 'all' || groupName === filter) {
            block.style.display = 'block';
          } else {
            block.style.display = 'none';
          }
        });
      }
    });
  });
}
