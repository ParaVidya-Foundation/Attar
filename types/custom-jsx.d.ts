import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      author: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
