import { Component, type OnInit, Input } from "@angular/core"

@Component({
  selector: "app-user-panel",
  standalone: false,
  templateUrl: "./user-panel.component.html",
  styleUrl: "./user-panel.component.css",
})
export class UserPanelComponent implements OnInit {
  @Input() initialTheme?: 'light' | 'dark' = 'light';
  
  isMenuOpen = false;
  isDarkMode = false;
  activeTab = "rental";

  constructor() {}

  ngOnInit(): void {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || this.initialTheme === 'dark') {
      this.enableDarkMode();
    }

    // Initialize tabs
    this.initTabs();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme(): void {
    if (this.isDarkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  enableDarkMode(): void {
    document.body.classList.add("dark");
    this.isDarkMode = true;
    localStorage.setItem("theme", "dark");
  }

  disableDarkMode(): void {
    document.body.classList.remove("dark");
    this.isDarkMode = false;
    localStorage.setItem("theme", "light");
  }

  initTabs(): void {
    setTimeout(() => {
      const tabButtons = document.querySelectorAll(".tab-btn");
      const tabPanes = document.querySelectorAll(".tab-pane");

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const tabId = button.getAttribute("data-tab");

          // Remove active class from all buttons and panes
          tabButtons.forEach((btn) => btn.classList.remove("active"));
          tabPanes.forEach((pane) => pane.classList.remove("active"));

          // Add active class to current button and pane
          button.classList.add("active");
          if (tabId) {
            document.getElementById(tabId)?.classList.add("active");
          }
        });
      });
    }, 0);
  }
  
  
  // Handle tab selection
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}

