var gitHub = new GitHub();
var coursera = gitHub.getOrganization("coursera");
var repoHighlights = document.getElementById('repo-highlights');
var repoOthers = document.getElementById('repo-others');
var repoHighlightTemplate = document.getElementById("repo-highlight-template");
var repoTemplate = document.getElementById("repo-template");
var highlightedRepos = ['courier', 'foody', 'courseraresearchexports', 'naptime', 'retracked', 'buggy'];

// remove template from DOM
repoHighlightTemplate.parentNode.removeChild(repoHighlightTemplate);
repoTemplate.parentNode.removeChild(repoTemplate);

var makeRepoCard = function(data, highlights) {
  var containerNode = highlights ? repoHighlights : repoOthers;
  var node = highlights ? repoHighlightTemplate.cloneNode(true) : repoTemplate.cloneNode(true);

  if (highlights) {
    node.getElementsByClassName('repo-inner-panel')[0].style.backgroundColor = "#9f9f9f";
  } else {
    node.className += " repo-coded-in-" + (data.language || 'Other');
  }

  node.style.display = "block";
  node.getElementsByClassName('repo-title-text')[0].textContent = data.name;
  node.getElementsByClassName('repo-description-text')[0].textContent = data.description;
  node.getElementsByClassName('repo-forks-text')[0].textContent = data.forks;
  node.getElementsByClassName('repo-stars-text')[0].textContent = data.stargazers_count;
  node.getElementsByClassName('repo-title-link')[0].href = data.clone_url;
  node.getElementsByClassName('repo-link')[0].href = data.clone_url;
  node.getElementsByClassName('repo-language-text')[0].textContent = data.language;

  containerNode.appendChild(node);
}

var initializeLanguageLink = function(languageLink, language) {
  languageLink.className = 'repo-language-link';
  languageLink.textContent = language;
  languageLink.addEventListener('click', function(e) {
    var node = e.currentTarget;
    var on = /repo-language-link-on/.test(node.className);
    var panels = document.getElementsByClassName('repo-panel');
    var links = document.getElementsByClassName('repo-language-link');

    for(var i = 0; i < links.length; i++) {
      links[i].className = node.className.replace(/repo-language-link-on/, '');
      if (links[i] == node && !on) {
        node.className += ' repo-language-link-on';
      }
    }

    for(var i = 0; i < panels.length; i++) {
      if (!/repo-panel-highlight/.test(panels[i].className)) {
        if (!on && !(new RegExp('repo-coded-in-' + language + '(\s+|$)')).test(panels[i].className)) {
          panels[i].style.display = 'none';
        } else {
          panels[i].style.display = 'block';
        }
      }
    }
  });
}

var getCourseraRepositories = function() {
  coursera.getRepos().then(function(repos) {
    var data = repos.data;
    var counts = {stars:0, repos:0, forks:0, languages:{Other:0}};
    var highlightedRepoRegExp = new RegExp(highlightedRepos.join('|'), 'i');
  
    for(var i = 0; i < data.length; i++) {
      var repo = data[i];
      var highlighted = highlightedRepoRegExp.test(repo.name);

      if (highlighted || !repo.fork) {
        counts.stars += repo.stargazers_count;
        counts.repos++;
        counts.forks += repo.forks;

        if (repo.language) {
          counts.languages[repo.language] = counts.languages[repo.language] ? counts.languages[repo.language] + 1 : 1;
        }

        makeRepoCard(repo, highlighted);
      }
    }
  
    document.getElementById('repo-counts-stars').textContent = counts.stars;
    document.getElementById('repo-counts-repos').textContent = counts.repos;
    document.getElementById('repo-counts-forks').textContent = counts.forks;
  
    var languageList = document.getElementById('repo-languages');
  
    for(var language in counts.languages) {
      var languageLink = document.createElement('div');
      initializeLanguageLink(languageLink, language);
      languageList.appendChild(languageLink);
    }
  });
}

// kick it off
getCourseraRepositories();
