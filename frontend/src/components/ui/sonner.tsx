import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/features/theme/theme";
import { CheckCircleSolid, DangerCircleSolid, InfoSolid, XCircleSolid } from "@mynaui/icons-react";
import { LoaderCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useTheme().theme;

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircleSolid size={20} stroke={1} className="text-green-500" />,
        info: <InfoSolid size={20} className="text-blue-500" />,
        warning: <DangerCircleSolid size={20} className="text-amber-500" />,
        error: <XCircleSolid size={20} className="text-red-500" />,
        loading: <LoaderCircle size={20} className="animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground bg-background",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
