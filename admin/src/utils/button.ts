import { h } from "vue";
import { NButton, NTooltip } from "naive-ui";
import { Icon } from "#components";

interface CreateButtonOptions {
  onClick: () => void;
  icon: string;
  style?: Record<string, string>;
  disabled?: boolean;
  tooltip?: string;
  iconColor?: string;
  type?: "error" | "success" | "warning" | "info";
}

export const createButton = ({
  icon,
  onClick,
  style = {
    marginRight: '6px'
  },
  disabled = false,
  tooltip,
  iconColor = 'white',
  type = 'info'
}: CreateButtonOptions) => {
  const button = h(
    NButton,
    {
      size: "small",
      
      disabled,
      onClick,
      style: {
        marginRight: "6px",
        ...style,
      },
      type: type,
    },
    { 
      default: () => h(Icon as any, { 
        name: icon, 
        size: "18",
        style: {
          color: iconColor,
        }
      }) 
    }
  );

  if (tooltip) {
    return h(
      NTooltip,
      { trigger: "hover" },
      {
        default: () => tooltip,
        trigger: () => button,
      }
    );
  }

  return button;
};