function copyCode() {
    let code = document.getElementById('specialCode').innerHTML;
    navigator.clipboard.writeText(code); // Only works in secure contexts
}

function loadCode() {
    let path = window.location.pathname;
    let page = path.split("/").pop().split('.')[0];
    document.getElementById('specialCode').innerHTML = page;
}

var sites = ['https://insect.sh/',
    'https://www.newtonproject.ox.ac.uk/',
    'http://www.adinkra.org/htmls/adinkra_index.htm',
    'https://www.helioviewer.org/',
    'https://medialab.github.io/iwanthue/'];

function openUrl() {
    window.location.href = sites[getRandom()];
    return false;
}

function getRandom() {
    // Needs to be its own function to get diff value
    // without page refresh
    return Math.round(Math.random() * (sites.length - 1));
}