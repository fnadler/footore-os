import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Portado de design_system.html (.button real do Footlink) — radius 8px,
// hover levanta com shadow (não muda cor), variantes de cor mapeadas do
// SCSS real (a variante "primary" se chama .green no CSS original, mas
// renderiza roxo #5a00ff; mantido o nome semântico "default" aqui).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        outline:
          "border-border bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary:
          "border-border bg-card text-primary hover:bg-primary/10",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-accent",
        destructive:
          "border-transparent bg-destructive text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:opacity-90",
        link: "border-transparent bg-transparent text-primary p-0! h-auto! underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-1.5 px-5",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-[34px] gap-1.5 px-4 text-[13px]",
        lg: "h-12 gap-2 px-7 text-base",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
