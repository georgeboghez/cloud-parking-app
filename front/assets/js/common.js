// function setThemeToLight(root) {
//     root.style.setProperty("--primary", "#f0ffff");
//     root.style.setProperty("--secondary", "#095555");
//     root.style.setProperty("--secondary-gradient", "linear-gradient(90deg, rgba(3,207,207,1) 0%, rgba(9,85,85,1) 100%)");
//     root.style.setProperty("--secondary-transparent", "rgba(3,207,207, .35)");
//     root.style.setProperty("--content-color", "#095555");
//     root.style.setProperty("--content-color-opposite", "#f0ffff");
//     root.style.setProperty("--grey", "#bceded");
// }

// function setThemeToDark(root) {
//     root.style.setProperty("--primary", "rgba(16, 15, 24, 40)");
//     root.style.setProperty("--secondary", "rgba(255, 138, 0, 1)");
//     root.style.setProperty("--secondary-gradient", " linear-gradient(90deg, #ff8a00 0%, #e52e71 100%)");
//     root.style.setProperty("--secondary-transparent", "rgba(255, 138, 0, .35)");
//     root.style.setProperty("--content-color", "#fff");
//     root.style.setProperty("--content-color-opposite", "rgba(16, 15, 24, 40)");
//     root.style.setProperty("--grey", "#201c29");
// }

// function changeTheme() {
//     let root = document.documentElement;
//     if (getComputedStyle(root).getPropertyValue("--secondary-gradient") == " linear-gradient(90deg, #ff8a00 0%, #e52e71 100%)") {
//         setThemeToLight(root);
//         localStorage.setItem("theme", "light");
//     }
//     else {
//         setThemeToDark(root);
//         localStorage.setItem("theme", "dark");
//     }
// }

// function loadTheme() {
//     let theme = localStorage.getItem("theme");
//     let root = document.documentElement;
//     if(theme === "light") {
//         setThemeToLight(root);
//     }
//     else {
//         setThemeToDark(root);
//     }
// }