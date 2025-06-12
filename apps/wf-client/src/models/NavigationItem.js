class NavigationItem {
  constructor(id, title, icon, order) {
    this.id = id;
    this.title = title;
    this.icon = icon || 'CircleIcon';
    this.order = order || 999;
  }
  
  getDisplayTitle() {
    return this.title;
  }
}

class NavigationLink extends NavigationItem {
  constructor(id, title, path, icon, order) {
    super(id, title, icon, order);
    this.path = path;
  }
  
  navigate(history) {
    if (history) {
      history.push(this.path);
    }
    return this.path;
  }
}

class NavigationGroup extends NavigationItem {
  constructor(id, title, children, icon, order) {
    super(id, title, icon, order);
    this.children = children || [];
  }
  
  addChild(child) {
    this.children.push(child);
    this.children.sort((a, b) => a.order - b.order);
  }
  
  getChildren() {
    return this.children;
  }
}

export { NavigationItem, NavigationLink, NavigationGroup };