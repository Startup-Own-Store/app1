package com.ajay.ownstoredemo;

import android.app.Application;
import android.content.res.Configuration;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactHost;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return true; // Enable for debug builds
        }

        @Override
        protected List<ReactPackage> getPackages() {
          // Add your packages here
          return Arrays.<ReactPackage>asList(
              // new MainReactPackage() // This is included by default
          );
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        public boolean isNewArchEnabled() {
          return false; // Disable new architecture
        }

        @Override
        protected Boolean isHermesEnabled() {
          return true; // Enable Hermes
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public ReactHost getReactHost() {
    return null; // Not using new architecture for now
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
  }

  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
  }
}