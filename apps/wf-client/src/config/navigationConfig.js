import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '@whatsfresh/shared-config';

export const navigationConfig = [
	{
		title: 'Dashboard',
		path: ROUTES.DASHBOARD.path, // Should be '/welcome'
		icon: <HomeIcon />
	},
	{
		title: 'Ingredients',
		path: ROUTES.INGREDIENTS.path, // Use direct path instead of '/ingredients/smart'
		icon: <RestaurantIcon />,
		children: [
			{
				title: 'Ingredient Types',
				path: ROUTES.INGREDIENT_TYPES.path // Should be '/ingredients/types'
			},
			{
				title: 'All Ingredients',
				path: ROUTES.INGREDIENTS.path
			}
		]
	},
	{
		title: 'Products',
		path: '/products',
		icon: <LocalDiningIcon />
	},
	{
		title: 'Inventory',
		path: '/inventory',
		icon: <InventoryIcon />
	},
	{
		title: 'Accounts',
		path: '/accounts',
		icon: <PeopleIcon />
	},
	{
		title: 'Settings',
		path: '/settings',
		icon: <SettingsIcon />
	}
];
