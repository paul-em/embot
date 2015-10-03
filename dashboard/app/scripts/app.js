/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');


  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };


  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    //var socket = io.connect('http://192.168.1.23:3000'); // jshint ignore:line
    var status = document.querySelector('#status');
    var socket = io.connect(); // jshint ignore:line


    var steerCtrl = document.querySelector('embot-steer-control');
    steerCtrl.addEventListener('action', function(data){
      socket.emit('steer', data.detail);
    });

    var sonar = document.querySelector('embot-sonar');
    sonar.left = 31;
    sonar.center = 200;
    sonar.right = 1;

    var lngList = document.querySelector('embot-lng-list');
    var soundList = document.querySelector('embot-sound-list');

    soundList.addEventListener('play', function(e){
      console.log('play', e.detail, lngList.selected);
      socket.emit('playSound', {
        lng: lngList.selected,
        sound: e.detail
      });
    });


    socket.on('connect', function () {
      console.log('connected');
      status.innerText = 'connected';
    });
    socket.on('disconnect', function () {
      console.log('disconnected');
      status.innerText = 'disconnected';
    });

    socket.on('soundList', function(data){
      console.log('got soundList', data);
      var list = [];
      for(var i in data){
        list.push({
          val: i,
          name: data[i]
        });
      }
      soundList.soundList = list;
    });

    socket.on('lngList', function(data){
      console.log('got lngList', data);
      lngList.lngList = data;
    });

    socket.on('data', function (data) {
      console.log('got data', data.sonar);
      sonar.left = data.sonar[0];
      sonar.center = data.sonar[1];
      sonar.right = data.sonar[2];
    });

  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('.app-name');
    var middleContainer = document.querySelector('.middle-container');
    var bottomContainer = document.querySelector('.bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

})(document);
