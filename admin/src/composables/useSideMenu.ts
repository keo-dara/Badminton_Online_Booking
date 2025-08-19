import { type MenuOption } from "naive-ui";
import { RouterLink } from "vue-router";
import { Icon } from "#components";
import { RoleUser } from "~/models";

export const useSideMenu = (role?: RoleUser) => {
  const admin: MenuOption[] = [
    createMenu("/", "booking", "solar:inbox-archive-outline", "1em"), 
    createMenu("/time", "time", "solar:alarm-add-linear", "1em"),
    createMenu("/court", "court", "solar:box-minimalistic-line-duotone", "1em"),
    
    createMenu(
      "/customer",
      "customer",
      "solar:user-rounded-line-duotone",
      "1em"
    ),
    createMenu(
      "/member",
      "member",
      "solar:users-group-rounded-line-duotone",
      "1em"
    ),

    createMenu("/profile", "profile", "solar:user-outline", "1em"),
  ];
  const sale: MenuOption[] = [
    createMenu("/", "sale", "solar:inbox-archive-outline", "1em"),
    createMenu("/transaction", "transaction", "solar:hand-money-broken", "1em"),
    createMenu("/profile", "profile", "solar:user-outline", "1em"),
  ];
  const root: MenuOption[] = [
    createMenu(
      "/user",
      "user",
      "solar:users-group-rounded-line-duotone",
      "1em"
    ),
    createMenu("/profile", "profile", "ic:round-person-outline", "1em"),
  ];

  if (role === RoleUser.Root) {
    return { menus: root };
  } else if (role === RoleUser.Sale) {
    return { menus: sale };
  }

  return { menus: admin };
};

function createMenu(
  to: string,
  toName: string,
  icName?: string,
  icSize?: string,
  children?: MenuOption[],
  key?: string
): MenuOption {
  const { $i18n } = useNuxtApp();

  const icon = icName && icSize ? renderIcon(icName, icSize) : undefined;

  return {
    label: () =>
      h(
        RouterLink,
        { to, "data-testid": `menu-item-${toName}` },
        { default: () => $i18n.t(toName) }
      ),
    key: key ?? to,
    icon,
    children,
  };
}

function renderIcon(name: string, size: string) {
  return () => h(Icon, { name, size });
}
