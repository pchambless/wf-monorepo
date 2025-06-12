import { NavigationLink, NavigationGroup } from '../models/NavigationItem';
import { navigationConfig } from '../config/navigationConfig';

class NavigationFactory {
  static createNavigationTree() {
    return navigationConfig.main.map(item => {
      if (item.children && item.children.length > 0) {
        const children = item.children.map(child => 
          new NavigationLink(child.id, child.title, child.path, child.icon, child.order)
        );
        
        return new NavigationGroup(item.id, item.title, children, item.icon, item.order);
      } else {
        return new NavigationLink(item.id, item.title, item.path, item.icon, item.order);
      }
    }).sort((a, b) => a.order - b.order);
  }
  
  static createService() {
    return new NavigationService(navigationConfig);
  }
}

export default NavigationFactory;
