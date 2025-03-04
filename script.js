document.addEventListener('DOMContentLoaded', function () {
    // Sidebar Toggle Logic
    const toggleButton = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');

    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('collapsed');
        });
    } else {
        console.error('Menu toggle button or sidebar not found.');
    }

    // Ensure the correct page loads on refresh
    const savedPage = sessionStorage.getItem('lastPage') || 'home.html';
    loadPage(savedPage, false); // Load last page but don't update URL

    // Listen for navigation clicks
    document.body.addEventListener("click", function (event) {
        let target = event.target.closest("[data-page]");
        if (target) {
            event.preventDefault();
            let page = target.getAttribute("data-page");
            loadPage(page);
        }
    });
});

// Function to Load Pages into #content Without Changing the URL
function loadPage(page, updateHistory = true) {
    fetch(page)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            let contentDiv = document.getElementById('content');
            if (contentDiv) {
                contentDiv.innerHTML = data; // Replace only main content
            }

            if (updateHistory) {
                sessionStorage.setItem('lastPage', page);
            }

            // Reload blog posts if home.html is loaded
            if (page === 'home.html') {
                loadBlogPosts();
            }
        })
        .catch(error => console.error('Error loading page:', error));
}

// Load Blog Posts from JSON
function loadBlogPosts() {
    fetch('blog-posts.json')
        .then(response => response.json())
        .then(posts => {
            let blogList = document.getElementById('blog-list');
            let container = document.getElementById('blog-list-container');
            if (!blogList || !container) return;

            blogList.innerHTML = ""; // Clear existing list
            posts.forEach((post, index) => {
                let listItem = document.createElement('li');
                listItem.classList.add("blog-item");
                listItem.innerHTML = `
                    <a href="#" onclick="loadBlogPost(${index})" class="blog-link">
                        <img src="${post.image}" alt="${post.title}" class="blog-image">
                        <div class="blog-details">
                            <h3>${post.title}</h3>
                            <p>${post.date}</p>
                            <p>${post.content.substring(0, 100)}...</p>
                        </div>
                    </a>
                `;
                blogList.appendChild(listItem);
            });

            // Force scrollbar visibility
            container.style.overflowX = "auto";
        })
        .catch(error => console.error('Error loading blog posts:', error));
}

function loadBlogPost(index) {
    fetch('blog-posts.json')
        .then(response => response.json())
        .then(posts => {
            let post = posts[index];

            let linkHTML = "";
            if (post.link && post.link.url && post.link.label) {
                linkHTML = `<p><a href="${post.link.url}" target="_blank">LINK: ${post.link.label}</a></p>`;
            }

            document.getElementById('blog-content').innerHTML = `
                <h2>${post.title}</h2>
                <p>Published on: ${post.date}</p>
                ${linkHTML}
                <img src="${post.image}" alt="${post.title}">
                <p>${post.content}</p>
                
            `;
            history.pushState(null, "", `#post-${index}`);
        })
        .catch(error => console.error('Error loading blog post:', error));
}
