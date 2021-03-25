package com.balsamquiz;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class StoragePackage implements ReactPackage {

 @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    // we create a module list we want to expose to ReactNative app
    List<NativeModule> modules = new ArrayList<>();
    // here is our Storage Module we want to add, we get on to that in a minute
    modules.add(new StorageModule(reactContext));
    return modules;
  }

}
