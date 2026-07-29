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

// Reel Slider Navigation
const reelSliders = document.querySelectorAll('[data-reel-slider]');
reelSliders.forEach(slider => {
  const block = slider.closest('.category-group-block');
  if (!block) return;
  const prevBtn = block.querySelector('.reel-prev');
  const nextBtn = block.querySelector('.reel-next');
  
  if (prevBtn && nextBtn) {
    const scrollAmount = 300; // rough width of a card + gap
    
    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }
});
