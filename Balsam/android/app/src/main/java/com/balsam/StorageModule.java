package com.balsamquiz;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;

import java.util.*;
import java.io.*;

public class StorageModule extends ReactContextBaseJavaModule {
  StorageModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "Storage";
  }

  @ReactMethod
  public void get_files_paths(Promise promise) {
    try {
      String path = "/storage/emulated/0/Download";
      File files = new File(path);

      FilenameFilter filter = new FilenameFilter() {
        @Override
        public boolean accept(File f, String name) {
          return name.endsWith(".quiz");
        }
      };

      File[] files_array = files.listFiles(filter);
      ArrayList < String > files_arrayList = new ArrayList < String > ();
      for (File file: files_array) {
        String file_path = file.getAbsolutePath();
        files_arrayList.add(file_path);
      }

      String[] return_array = new String[files_arrayList.size()];
      return_array = files_arrayList.toArray(return_array);

      WritableArray promise_array = Arguments.createArray();
      for (int i = 0; i < return_array.length; i++) {
        promise_array.pushString(return_array[i]);
      }
      promise.resolve(promise_array);
    } catch (Exception e) {
      promise.reject("Something went wrong: ", e);
    }
  }
}