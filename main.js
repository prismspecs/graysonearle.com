// load nav menu from json
fetch('json/menu.json')
    .then(response => response.json())
    .then(data => {
        const menuContainer = document.getElementById('menu');
        // iterate through each item in the JSON data and create corresponding HTML elements
        data.forEach(item => {
            const link = document.createElement('a');
            link.href = item.url;
            link.textContent = item.title;
            menuContainer.appendChild(link);
        });

        // if a link's text matches the data-active attribute of the nav container, add the active class to that link
        const navContainer = document.querySelector('.nav');
        const navLinks = navContainer.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.textContent === navContainer.dataset.active) {
                link.classList.add('active');
            }
        });

    })
    .catch(error => {
        console.error('Error fetching menu data:', error);
    });


// load data.json for left column
fetch('json/events.json')
    .then(response => response.json())
    .then(jsonData => {
        // Loop through the data
        jsonData.forEach(entry => {
            // Create a new div element with the class "item"
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            // Create spans for role, what, institution, city, and when
            const roleSpan = document.createElement('span');
            roleSpan.classList.add('role');
            roleSpan.textContent = entry.role;

            const whatSpan = document.createElement('span');
            whatSpan.classList.add('what');
            const whatLink = document.createElement('a');
            whatLink.setAttribute('href', entry.link);
            whatLink.textContent = entry.what;
            whatSpan.appendChild(whatLink);

            const institutionSpan = document.createElement('span');
            institutionSpan.classList.add('institution');
            institutionSpan.textContent = entry.institution;

            const citySpan = document.createElement('span');
            citySpan.classList.add('city');
            citySpan.textContent = entry.city;

            // Create a span for the curator
            const curatorSpan = document.createElement('span');
            curatorSpan.classList.add('curator');

            // if it isnt blank
            if (entry.curator) {
                curatorSpan.textContent = `curated by ${entry.curator}`;
            }


            const whenSpan = document.createElement('span');
            whenSpan.classList.add('when');


            // change date format
            const date_start = new Date(entry.startDate);
            const date_end = new Date(entry.endDate);
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            entry.startDate = date_start.toLocaleDateString('en-US', options);
            entry.endDate = date_end.toLocaleDateString('en-US', options);

            // if the start and end date are the same
            if (entry.startDate === entry.endDate) {
                whenSpan.textContent = entry.startDate;
            } else {
                whenSpan.textContent = `${entry.startDate} – ${entry.endDate}`;
            }


            // Append spans to the itemDiv but only if they are not blank
            if (roleSpan.textContent) {
                itemDiv.appendChild(roleSpan);
            }
            if (whatSpan.textContent) {
                itemDiv.appendChild(whatSpan);
            }
            if (institutionSpan.textContent) {
                itemDiv.appendChild(institutionSpan);
            }
            if (citySpan.textContent) {
                itemDiv.appendChild(citySpan);
            }
            if (curatorSpan) {
                // itemDiv.appendChild(curatorSpan);
            }
            if (whenSpan.textContent) {
                itemDiv.appendChild(whenSpan);
            }


            // Determine which section to append the itemDiv to
            let section;
            const currentDate = new Date();
            const startDate = new Date(entry.startDate);
            const endDate = new Date(entry.endDate);

            if (endDate > currentDate) {
                section = document.querySelector('.now');
            } else {
                section = document.querySelector('.past');
            }

            // Append the itemDiv to the correct section
            section.appendChild(itemDiv);
        });
    });




// -------- NEXT/PREVIOUS pages for the blogroll

document.addEventListener('DOMContentLoaded', function () {
    let startIndex = 0; // Index of the first item to display
    const itemsPerPage = 5; // Number of items to display per page

    const container = document.querySelector('.column.show-off .inner-content');

    // Function to display items based on the current start index
    function displayItems(data) {
        // Clear existing items in the container
        container.innerHTML = '';

        // Display the next items from the data starting from the current start index
        for (let i = startIndex; i < startIndex + itemsPerPage && i < data.length; i++) {
            const item = data[i];

            const divItem = document.createElement('div');
            divItem.classList.add('item');

            const anchor = document.createElement('a');
            anchor.setAttribute('href', item.link);

            const image = document.createElement('img');
            image.setAttribute('src', item.imageSrc);
            image.setAttribute('alt', item.altText);

            const caption = document.createElement('p');
            caption.classList.add('caption');
            caption.textContent = item.caption;

            anchor.appendChild(image);
            divItem.appendChild(anchor);
            divItem.appendChild(caption);

            container.appendChild(divItem);
        }

        const paginationContainer = document.querySelector('.pagination');

        // Clear existing pagination buttons
        paginationContainer.innerHTML = '';

        // Calculate the total number of pages
        const totalPages = Math.ceil(data.length / itemsPerPage);

        // Create pagination buttons for each page
        for (let page = 1; page <= totalPages; page++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = page;
            pageButton.addEventListener('click', () => {
                startIndex = (page - 1) * itemsPerPage; // Calculate new start index for the selected page
                displayItems(data); // Display items for the selected page
                setActivePage(page); // Set active class for the selected page button

                // if its mobile, scroll to the top of the container
                // otherwise, scroll to the top of the page

                if (window.innerWidth < 768) {
                    container.scrollIntoView({ behavior: 'smooth' });
                } else {
                    document.documentElement.scrollIntoView({ behavior: 'smooth' });
                }

            });
            paginationContainer.appendChild(pageButton);
        }

        // Set active class for the initial page button
        setActivePage(1);
    }

    // Function to set active class for the page button
    function setActivePage(activePage) {
        const pageButtons = document.querySelectorAll('.pagination button');
        pageButtons.forEach(button => {
            if (parseInt(button.textContent) === activePage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Fetch the data from JSON file
    fetch('json/blogroll.json')
        .then(response => response.json())
        .then(data => {
            // Sort the data based on the date property in descending order
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Display the initial set of items
            displayItems(data);
        })
        .catch(error => console.error('Error fetching data:', error));

});


document.addEventListener('click', function (event) {
    // Check if the clicked element is a link
    var link = event.target.closest('a');
    if (link) {
        // Check if any ancestor of the clicked link has the class .links-newtab
        var ancestor = link.closest('.links-newtab');
        if (ancestor) {
            // If so, open the link in a new tab
            link.setAttribute('target', '_blank');
        }
    }
});