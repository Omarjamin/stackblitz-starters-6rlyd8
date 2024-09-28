document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = "Q9g0LF0Pk3m1RpAG05nUd6uhmJO4X5sp";
  const articleContainer = document.getElementById("articles");
  const searchButton = document.getElementById("search-button");
  const articlesTitle = document.getElementById("articles-title");
  const fallbackImage = 'https://via.placeholder.com/300';

 
  async function fetchTopStoriesBySection(section) {
      try {
          const response = await fetch(`https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${API_KEY}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          return data.results.slice(0, 3); // Return top 3 stories
      } catch (error) {
          console.error(`Error fetching Top Stories for ${section}:`, error);
          return [];
      }
  }

 
  async function fetchAndDisplayTopStories() {
      const sections = ['world', 'business', 'technology', 'health', 'sports'];
      const topArticles = [];

      for (let section of sections) {
          const articles = await fetchTopStoriesBySection(section);
          if (articles.length > 0) {
              topArticles.push({ section, articles });
          }
      }

      displayTopStoriesBySection(topArticles);
  }

 
  function displayTopStoriesBySection(topArticles) {
      articleContainer.innerHTML = '';
      topArticles.forEach(({ section, articles }) => {
          const sectionTitle = document.createElement('h3');
          sectionTitle.innerText = section.charAt(0).toUpperCase() + section.slice(1);
          articleContainer.appendChild(sectionTitle);

          const sectionDiv = document.createElement('div');
          sectionDiv.classList.add('articles-grid');

          articles.forEach(article => {
              const imageUrl = article.multimedia && article.multimedia.length > 0
                  ? article.multimedia[0].url
                  : fallbackImage;

              const articleItem = document.createElement('div');
              articleItem.classList.add('article-item');
              articleItem.innerHTML = `
                  <img src="${imageUrl}" alt="${article.title || 'No Title'}">
                  <div class="article-content">
                      <h4>${article.title || 'No Title'}</h4>
                      <p>${article.abstract || 'No Abstract Available'}</p>
                      <a href="${article.url || '#'}" target="_blank">Read more</a>
                  </div>
              `;
              sectionDiv.appendChild(articleItem);
          });
          articleContainer.appendChild(sectionDiv);
      });
  }

 
  async function fetchArticlesByKeyword(keyword, sectionTitle) {
      try {
          const queryParams = new URLSearchParams({ q: keyword, 'api-key': API_KEY });
          const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          displayArticles(data.response.docs, sectionTitle);
      } catch (error) {
          console.error(`Error fetching ${sectionTitle} articles:`, error);
          displayError(`Failed to fetch ${sectionTitle} articles. Please try again.`);
      }
  }

  
  function displayArticles(articles, title) {
      articlesTitle.innerText = title;
      articleContainer.innerHTML = '';

      const sectionDiv = document.createElement('div');
      sectionDiv.classList.add('articles-grid');
      
      articles.forEach(article => {
          const imageUrl = article.multimedia && article.multimedia.length > 0
              ? `https://static01.nyt.com/${article.multimedia[0].url}`
              : fallbackImage;

          const articleItem = document.createElement('div');
          articleItem.classList.add('article-item');
          articleItem.innerHTML = `
              <img src="${imageUrl}" alt="${article.headline?.main || 'No Title'}">
              <div class="article-content">
                  <h4>${article.headline?.main || 'No Title'}</h4>
                  <p>${article.snippet || 'No Snippet Available'}</p>
                  <a href="${article.web_url || '#'}" target="_blank">Read more</a>
              </div>
          `;
          sectionDiv.appendChild(articleItem);
      });

      articleContainer.appendChild(sectionDiv);
  }

 
  function displayError(message) {
      articleContainer.innerHTML = `<div class="error">${message}</div>`;
  }

 
  async function performSearch() {
      const keyword = document.getElementById('input-for-word').value;
      
      if (!keyword) {
          displayError("Please enter a keyword to search.");
          return;
      }
      
      try {
          const queryParams = new URLSearchParams({ q: keyword, 'api-key': API_KEY });
          const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          displayArticles(data.response.docs, "Search Results");
      } catch (error) {
          console.error("Error fetching search results:", error);
          displayError("Failed to fetch articles. Please try again.");
      }
  }

 
  searchButton.addEventListener('click', performSearch);

 
  const sectionButtons = document.querySelectorAll('.section-button');
  sectionButtons.forEach(button => {
      button.addEventListener('click', (event) => {
          event.preventDefault();
          const keyword = button.getAttribute('data-keyword');
          fetchArticlesByKeyword(keyword, button.textContent);
      });
  });

 
  fetchAndDisplayTopStories();
});
