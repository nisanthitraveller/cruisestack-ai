import type { DetailedHTMLProps, HTMLAttributes } from "react";

type StripeBuyButtonProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  "buy-button-id": string;
  "publishable-key": string;
  "client-reference-id"?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": StripeBuyButtonProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": StripeBuyButtonProps;
    }
  }
}

export {};
