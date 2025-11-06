export const Theme = {
  key: 'pref-theme',
  applyInitial(){
    const saved = localStorage.getItem(this.key);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const mode = saved ?? (prefersLight ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', mode==='light');
  },
  toggle(){
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem(Theme.key, isLight ? 'light' : 'dark');
  }
};
