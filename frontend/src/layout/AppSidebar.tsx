import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  TableIcon,
  UserCircleIcon,
  PlusIcon,
  LockIcon,
  UserIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { userHasPermission, userHasRole } from "../utils/DparcelHelper";

type SubNavItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  roles?: string[];
  permissions?: string[];
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[];
  roles?: string[];
  permissions?: string[];
};

// ✅ Example: restrict items by roles or permissions
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    roles: ["admin"], // 🔹 only admin role can see
  },
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/user/dashboard",
    permissions: ["user_dashboard"], // 🔹 only users with this permission
  },
  {
    icon: <UserIcon />,
    name: "Role & Permission",
    subItems: [
      { name: "Roles", path: "/roles" },
      { name: "Permissions", path: "/permissions" },
    ],
    roles: ["admin"], // 🔹 hide whole section unless role is admin
  },
  {
    icon: <PlusIcon />,
    name: "New order",
    path: "/calendar",
    permissions: ["create_order"], // 🔹 only if permission granted
  },
  {
    icon: <LockIcon />,
    name: "Batch import",
    path: "/profile",
    roles: ["admin"], // 🔹 only admin role can see
  },
  {
    name: "Orders",
    icon: <ListIcon />,
    path: "/form-elements",
    permissions: ["view_orders"],
  },
  {
    name: "Documents",
    icon: <TableIcon />,
    path: "/basic-tables",
    permissions: ["view_documents"],
  },
  {
    name: "Wallet",
    icon: <PageIcon />,
    path: "/blank",
    roles: ["shopper"], // 🔹 only shoppers can see
  },
  {
    name: "Profile",
    icon: <UserCircleIcon />,
    path: "/blank",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main", index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // ✅ Filter items before rendering based on roles & permissions
  // ✅ Filter main items
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        // Check roles
        if (item.roles && !item.roles.some((role) => userHasRole(role))) {
          return false;
        }
        // Check permissions
        if (item.permissions && !item.permissions.some((perm) => userHasPermission(perm))) {
          return false;
        }
        return true;
      })
      .map((item) => ({
        ...item,
        subItems: item.subItems ? filterSubNavItems(item.subItems) : undefined,
      }));
  };

  // ✅ Filter subItems separately
  const filterSubNavItems = (items: SubNavItem[]): SubNavItem[] => {
    return items.filter((subItem) => {
      if (subItem.roles && !subItem.roles.some((role) => userHasRole(role))) {
        return false;
      }
      if (subItem.permissions && !subItem.permissions.some((perm) => userHasPermission(perm))) {
        return false;
      }
      return true;
    });
  };

  // ✅ Get allowed items
  const allowedNavItems = filterNavItems(navItems);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] text-white"
                  : "text-white hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
                }`}
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path)
                    ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] text-white"
                    : "text-white hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
                  }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems?.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] text-white"
                          : "text-white hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span className="menu-dropdown-badge">new</span>
                        )}
                        {subItem.pro && (
                          <span className="menu-dropdown-badge">pro</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-2 left-0 h-screen transition-all duration-300 ease-in-out z-50 border-r bg-[linear-gradient(180deg,#003bff_25%,#0061ff_100%)]
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex">
        <Link to="/">
          <img
            src="/images/logo/dparcel-logo.svg"
            alt="Logo"
            width={60}
            height={40}
          />
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-4 text-xs uppercase text-gray-400">
                {isExpanded || isHovered || isMobileOpen ? (
                  <span>Welcome back</span>
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {/* ✅ Use filtered nav items here */}
              {renderMenuItems(allowedNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
