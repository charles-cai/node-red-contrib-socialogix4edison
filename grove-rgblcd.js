/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Drive the Grive RGB LCD (a JHD1313m1)
// We can do this in either of two ways
//
// The bext way is to use the upm library. which
// contains support for this device
//
// The alternative way is to drive the LCD directly from
// Javascript code using the i2c interface directly
// This approach is useful for learning about using
// the i2c bus. The lcd file is an implementation
// in Javascript for some of the common LCD functions

// configure jshint
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */


/*
// change this to false to use the hand rolled version
var useUpmVersion = false;//true;

// we want mraa to be at least version 0.6.1
var mraa = require('mraa');
var version = mraa.getVersion();

if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') ok');
}
else {
    console.log('meaa version(' + version + ') is old - this code may not work');
}

if (useUpmVersion) {
    useUpm();
    console.log("using upm");
}
else {
    useLcd();
    console.log("using lcd");
}
*/


/**
 * Rotate through a color pallette and display the
 * color of the background as text
 */
function rotateColors(display) {
    var red = 0;
    var green = 0;
    var blue = 0;
    display.setColor(red, green, blue);
    setInterval(function() {
        blue += 64;
        if (blue > 255) {
            blue = 0;
            green += 64;
            if (green > 255) {
                green = 0;
                red += 64;
                if (red > 255) {
                    red = 0;
                }
            }
        }
        display.setColor(red, green, blue);
        display.setCursor(0,0);
        display.write('red=' + red + ' grn=' + green + '  ');
        display.setCursor(1,0);
        display.write('blue=' + blue + '   ');  // extra padding clears out previous text
    }, 1000);
}



/*s
 * Use the upm library to drive the two line display
 *
 * Note that this does not use the "lcd.js" code at all
 */
function useUpm() {
    var lcd = require('jsupm_i2clcd');
    var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    display.setCursor(1, 1);
    display.write('hi there');
    display.setCursor(0,0);
    display.write('more text');
    rotateColors(display);
}

/**
 * Use the hand rolled lcd.js code to do the
 * same thing as the previous code without the
 * upm library
 */
function useLcd() {
    var lcd = require('./i2c_lcd');
    var display = new lcd.LCD(0);

    display.setColor(0, 60, 255);
    display.setCursor(1, 1);
    display.write('hi there');
    display.setCursor(0,0);  
    display.write('more text');
    display.waitForQuiescent()
    .then(function() {
        rotateColors(display);
    })
    .fail(function(err) {
        console.log(err);
        display.clearError();
        rotateColors(display);
    });
}




module.exports = function(RED) {
    var m = require('mraa');
    //console.log("BOARD :",m.getPlatformName());

    function GroveRGBLCD(config) {
        var y = parseInt(config.y || 0);
                
        var lcd = require('./i2clcd');
        var display = new lcd.LCD(0);
        
        RED.nodes.createNode(this, config);
        
        var node = this;
        this.on('input', function(msg) {
            //msg.payload = msg.payload;

            display.setColor(255, 255, 255);
            display.setCursor(0, y);
            display.write(msg.payload);
            
            // node.send(msg);
        });
 
 /*       
        var msg = { payload:g, topic:node.board+"/D"+node.pin };
        switch (g) {
            case 0:
                node.status({fill:"green",shape:"ring",text:"low"});
                if (node.interrupt=== "f" || node.interrupt === "b") {
                    node.send(msg);
                }
                break;
            case 1:
                node.status({fill:"green",shape:"dot",text:"high"});
                if (node.interrupt=== "r" || node.interrupt === "b") {
                    node.send(msg);
                }
                break;
            default:
                node.status({fill:"grey",shape:"ring",text:"unknown"});
        }
 */  
        this.on('close', function() {
      
        });
    }

    RED.nodes.registerType("grove-rgblcd", GroveRGBLCD);
}

