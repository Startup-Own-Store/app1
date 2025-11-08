declare module 'expo-navigation-bar' {
  export type NavigationBarButtonStyle = 'light' | 'dark';
  export type NavigationBarVisibility =
    | 'auto'
    | 'hidden'
    | 'leanback'
    | 'immersive'
    | 'sticky-immersive'
    | 'visible';

  export function setBackgroundColorAsync(color: string): Promise<void>;
  export function setButtonStyleAsync(style: NavigationBarButtonStyle): Promise<void>;
  export function setVisibilityAsync(visibility: NavigationBarVisibility): Promise<void>;
}
