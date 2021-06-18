'use strict';

const app = require('electron')
const { BrowserWindow, dialog } = require('electron').remote
const fs = require('fs')
const FindInPage = require('electron-find').FindInPage

function download(data, filename) {
    var file = new Blob([data], {type: "text/plain"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function TypeSelector() {
  var me = {
    MODES: [null, 'o', 'p', 'd'],

    init: function (svg, taxa, size, mode=null) {
      if (mode != null){
        mode = mode.replace(/\*/g, '');
      }

      if (!me.MODES.includes(mode)){
        console.log("error with mode: " + mode);
      }

      me.size = size;
      me.svg = svg;
      me.taxa = taxa;

      me.ort_box = null;
      me.par_box = null;
      me.del_box = null;

      me.mode = mode;

      return me
    },

    draw: function () {
      var w = me.taxa.getBBox().width + 5;
      var h = me.taxa.getBBox().height / 2 - 5;

      me.ort_box = me.svg.rect(w, h, me.size, me.size);
      me.ort_box.attr({class: "checkmark", fill: "#a3ffb8",});
      // me.ort_mark = me.svg.image("img/o.svg", w+1, h-1, 10, 10);
      me.ort_mark = me.svg.text(w+1, h+8, 'o');
      me.ort_mark.attr({
          'font-size': 12,
          'fill': 'black',
          'stroke': 'none',
          'font-weight': 'bold'
      });
      me.ort_shape = me.svg.group(me.ort_box, me.ort_mark);
      me.taxa.after(me.ort_shape);

      w = w + me.ort_box.getBBox().width + 5;
      me.par_box = me.svg.rect(w, h, me.size, me.size);
      me.par_box.attr({class: "checkmark", fill: "#f1f49c",});
      // me.par_mark = me.svg.image("img/p.svg", w+1, h-1, 10, 10);
      me.par_mark = me.svg.text(w+1, h+8, 'p');
      me.par_mark.attr({
          'font-size': 12,
          'fill': 'black',
          'stroke': 'none',
          'font-weight': 'bold'
      });
      me.par_shape = me.svg.group(me.par_box, me.par_mark);
      me.ort_shape.after(me.par_shape);

      w = w + me.par_box.getBBox().width + 5;
      me.del_box = me.svg.rect(w, h, me.size, me.size);
      me.del_box.attr({class: "checkmark", fill: "#f7b08a",});
      // me.del_mark = me.svg.image("img/d.svg", w+1, h-1, 10, 10);
      me.del_mark = me.svg.text(w+1, h+8, 'd');
      me.del_mark.attr({
          'font-size': 12,
          'fill': 'black',
          'stroke': 'none',
          'font-weight': 'bold'
      });
      me.del_shape = me.svg.group(me.del_box, me.del_mark);
      me.par_shape.after(me.del_shape);

      me.ort_shape.click(function(){
        modes_touched = true;
        me.changeMode('o');
      });

      me.par_shape.click(function(){
        modes_touched = true;
        me.changeMode('p');
      });

      me.del_shape.click(function(){
        modes_touched = true;
        me.changeMode('d');
      });

      me.redrawMark();
    },

    redrawMark: function(){
      me.ort_mark.attr({opacity: 0});
      me.par_mark.attr({opacity: 0});
      me.del_mark.attr({opacity: 0});

      switch(me.mode){
        case('o'):
          me.ort_mark.attr({opacity: 1});
          break;
        case('p'):
          me.par_mark.attr({opacity: 1});
          break;
        case('d'):
          me.del_mark.attr({opacity: 1});
          break;
      }
    },

    changeMode: function(new_mode){
      if (!me.MODES.includes(new_mode)){
        console.log("error with mode: " + new_mode);
      }

      me.mode = new_mode;
      me.redrawMark();
    },

    remove: function(){
      me.ort_box.remove();
      me.ort_mark.remove();
      me.ort_shape.remove();

      me.par_box.remove();
      me.par_mark.remove();
      me.par_shape.remove();

      me.del_box.remove();
      me.del_mark.remove();
      me.del_shape.remove();
    }
  }

  return me;
  };

function elementIsTaxa(el){
  var text = el.attr("text");
  return (!text.match(/^[\d.]+$/g) && !text.match(/^\</g) && !elementIsClass(el));
}

function elementIsClass(el){
  return el.attr("text")[0] === '[';
}

function buildCsv(elements) {
  var text = "";
  var elementWithoutMode = null
  _.each(elements, function(val, key){
    var mode = val.type_selector.mode;

    if (elementWithoutMode == null && mode == null){
      elementWithoutMode = val;
      alert("You need to specify all the modes");
    }

    var klass = val.class.textContent.replace(/^\s+|\s+$/g, '').replace(/[\[|\]]/g, '');
    text += key + "\t" + klass + "\t" + mode + "\n";

  });

  if (elementWithoutMode != null){
    return null;
  }

  return text;
}

function applyCSV(data) {
  var lines = data.split("\n");

  _.each(lines, function(line){
    if (line.replace(/^\s+|\s+$/g, '') != ''){

      line = line.replace(/^\s+|\s+$/g, '').split("\t");

      var taxa = line[0];
      var klass = line[1];
      var mode = line[2].replace(/\*/g, '');

      if(elements[taxa] != undefined){
        elements[taxa].type_selector.changeMode(mode);

      } else {
        console.log(taxa + " " + mode);
      }
    }
  });

  tsv_applied = true;
  modes_touched = false;
}

function extractTaxaName(full_name){
  return full_name.split("@").slice(-1).pop().split("..p")[0];
}

function checkOrtologsDuplication() {
  var orts_cnt = {};

  _.each( elements, function( val, key ) {
    if (val.type_selector.mode == "o"){
      var taxa_name = extractTaxaName(key);
      if (orts_cnt[taxa_name]){
        orts_cnt[taxa_name] += 1;
      } else {
        orts_cnt[taxa_name] = 1;
      }
    }
  });

  var error_msg = null;
  _.each(orts_cnt, function( val, key ){
    if (val > 1){
      if (error_msg == null)
        error_msg = [];

      error_msg.push(key + " (" + val + ")")
    }
  });

  return error_msg;
}

function openSVG(raw_svg) {
  _.each( elements, function( val, key ) {
    val.type_selector.remove();
  });

  $("#svg").empty();
  elements = {};
  svg = null;

  $("#svg").append(raw_svg);
  svg = Snap("#svg > svg");
  $("#svg > svg").find("title").empty();

  _.each(svg.selectAll("text"), function(el){
    var taxa = el.attr("text");
    if(elementIsTaxa(el)){
      var ch = new TypeSelector().init(svg, el, 10);
      ch.draw();

      var klass = el.node.parentElement.nextElementSibling
      elements[taxa] = { element: el, class: klass, type_selector: ch};

    } else if (elementIsClass(el)){
      el.animate({x: 200}, 100);
    }
  });

  title = _.find(svg.selectAll("text"), function(el){
    return String(el.attr("text")).match(/^\</g);
  });

  if (title != null){
    title = title.node.textContent.replace(/[<>]/g, '').split(/[\.\s]/)[0];
  }

  tsv_applied = false;
};

// Smells bad, TODO: make object oriented

var svg = null;
var elements = {};
var title = null;
var tsv_applied = false;
var modes_touched = false;

$(document).ready(function () {
  var $spinner = $('#loading-block')

  var show_spinner = () => {
    $spinner.show()
  }

  var hide_spinner = () => {
    $spinner.hide()
  }

  $('#open-button').on("click", (e) => {
    if (modes_touched && !confirm('Are you sure? All unsaved data will be lost.')){
      return undefined
    }

    var options = {
      properties: ['openFile'],
      filters: [{ name: 'Tree files', extensions: ['svg'] }, { name: 'All files', extensions: ['*'] }],
      title: 'Open tree'
    }

    show_spinner()

    dialog.showOpenDialog(options).then(result => {
      if (result.filePaths.length == 0) {
        hide_spinner()
        return false
      }

      var path = result.filePaths[0]
      fs.readFile(path, 'utf8', (err, data) => {
        openSVG(data)
        modes_touched = false
        hide_spinner()
      })

    })
  })

  $('#apply-button').on("click", (e) => {
    if (modes_touched && !confirm('Are you sure? All unsaved data will be lost.')){
      return undefined;
    }

    var options = {
      properties: ['openFile'],
      filters: [{ name: 'TSV files', extensions: ['tsv'] }, { name: 'All files', extensions: ['*'] }],
      title: 'Import TSV'
    }

    show_spinner()

    dialog.showOpenDialog(options).then(result => {
      if (result.filePaths.length == 0) {
        hide_spinner()
        return false
      }

      var path = result.filePaths[0]
      fs.readFile(path, 'utf8', (err, data) => {
        applyCSV(data)
        modes_touched = false
        hide_spinner()
      })
    })
  })

  function generateAndDownloadTsv(){
    var text = buildCsv(elements);
    if (text != null){

      var filename = "tree.tsv";
      if (title != null){
        filename = title + "_parsed.tsv";
      }

      modes_touched = false;
      download(text, filename);
    }
  }

  $('#save-button').on("click", function(){
    var alert_msgs = checkOrtologsDuplication();

    if (alert_msgs != null){
      $("#tsv-alert-body").html("");

      _.each(alert_msgs, function(el){
        $("#tsv-alert-body").append(el+"</br>")
      });

      $("#AlertModal").modal("show");
    } else
      generateAndDownloadTsv();
  });

  $("#moveClassesLeft").on("click", function(){
    _.each(svg.selectAll("text"), function(el){
      if (elementIsClass(el)){
        var x = el.getBBox().x;
        el.attr('x', x-50);
      }
    })
  });

  $("#moveClassesRight").on("click", function(){
    _.each(svg.selectAll("text"), function(el){
      if (elementIsClass(el)){
        var x = el.getBBox().x;
        el.attr('x', x+50);
      }
    })
  });

  $("#svg > svg").css({width: "50%"});

  function getTreeZoom(){
    return( 100 * parseFloat($("#svg > svg").css('width')) / parseFloat($("#svg > svg").parent().css('width')) );

  }

  function getTreeTransform(){
    var result = {};

    var transform_attr = $("#svg > svg > g").attr("transform");

    if (transform_attr === undefined){
      return result;
    }

    _.each(transform_attr.split(','), function(data) {
      var spl = data.replace(")", "").split('(');
      result[spl[0]] = spl[1];
    });

    return result;
  }

  function setTreeTransform(attr, value){
    var current = getTreeTransform();

    current[attr] = value;

    var result = [];

    for (var key in current) {
      result.push(key+"("+current[key]+")");
    }

    $("#svg > svg > g").attr("transform", result.join());
  }

  function getTreeScale(){
    var transform = getTreeTransform();
    if (transform.scale == "" || transform.scale == undefined){
      return 1.0;
    } else {
      return parseFloat(transform.scale);
    }
  }

  $("#zoomIn").on("click", function(){
    var scale = getTreeScale();
    scale += 0.1;
    setTreeTransform('scale', scale);
  });

  $("#zoomFit").on("click", function(){
    setTreeTransform('scale', 1.0);
  });

  $("#zoomOut").on("click", function(){
    var scale = getTreeScale();
    scale -= 0.1;
    setTreeTransform('scale', scale);
  });

  $("button").on("click", function () { this.blur() } )

  // Shortcuts

  var menu = app.remote.Menu.getApplicationMenu()

  menu.setCallbackOnItem('open-tree', () => {
    $("#open-button").click()
  })

  menu.setCallbackOnItem('apply-tsv', () => {
    $("#apply-button").click()
  })

  menu.setCallbackOnItem('save-tsv', () => {
    $("#save-button").click()
  })

  // Find

  var findInPage = new FindInPage(app.remote.getCurrentWebContents(), {
    offsetTop: 65,
    duration: 150
  })

  menu.setCallbackOnItem('find', () => {
    findInPage.openFindWindow()
  })

  // Quit
  menu.setCallbackOnItem('quit', () => {
    if (modes_touched && !confirm('Are you sure? All unsaved data will be lost.')) {
      return true
    }

    app.remote.app.quit()
  })

});
