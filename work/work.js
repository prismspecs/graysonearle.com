document.addEventListener('DOMContentLoaded', () => {
    const workContainer = document.getElementById('work-container');

    // Fetch work items from work.json
    fetch('work.json')
        .then(response => response.json())
        .then(data => {
            data.items.forEach(item => {
                const workItem = document.createElement('a');
                workItem.href = item.link;
                workItem.classList.add('work-item');

                // Create inner HTML for each work item
                workItem.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.short_description}</p>
                    <img src="${item.thumbnail}" alt="${item.title}">
                `;

                workContainer.appendChild(workItem);
            });
        })
        .catch(error => console.error('Error loading work items:', error));
});
