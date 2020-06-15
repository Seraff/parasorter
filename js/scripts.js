'use strict';

const app = require('electron');
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
      me.ort_mark = me.svg.image("img/o.svg", w+1, h-1, 10, 10);
      me.ort_shape = me.svg.group(me.ort_box, me.ort_mark);
      me.taxa.after(me.ort_shape);

      w = w + me.ort_box.getBBox().width + 5;
      me.par_box = me.svg.rect(w, h, me.size, me.size);
      me.par_box.attr({class: "checkmark", fill: "#f1f49c",});
      me.par_mark = me.svg.image("img/p.svg", w+1, h-1, 10, 10);
      me.par_shape = me.svg.group(me.par_box, me.par_mark);
      me.ort_shape.after(me.par_shape);

      w = w + me.par_box.getBBox().width + 5;
      me.del_box = me.svg.rect(w, h, me.size, me.size);
      me.del_box.attr({class: "checkmark", fill: "#f7b08a",});
      me.del_mark = me.svg.image("img/d.svg", w+1, h-1, 10, 10);
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

  $('#openTreeButton').on("click", function(modal_e){
    if (modes_touched && !confirm('Are you sure? All unsaved data will be lost.')){
      return undefined;
    }

    var file = $('#openTreeInput')[0].files[0];

    if (file != undefined){
      var reader = new FileReader();
      reader.readAsText(file);

      $(modal_e.target).addClass('disabled');
      $(modal_e.target).children("span").removeClass('d-none');

      reader.onload = function(e){
        openSVG(reader.result);
        modes_touched = false;

        $(modal_e.target).removeClass('disabled');
        $(modal_e.target).children("span").addClass('d-none');

        $("#openTreeModal").modal('toggle');
      };
    }
  });

  $('#applyCSVFileButton').on("click", function(modal_e){
    if (modes_touched && !confirm('Are you sure? All unsaved data will be lost.')){
      return undefined;
    }

    var file = $('#applyCSVFileInput')[0].files[0];

    if (file != undefined){
      var reader = new FileReader();
      reader.readAsText(file);

      $(modal_e.target).addClass('disabled');
      $(modal_e.target).children("span").removeClass('d-none');

      reader.onload = function(e){
        applyCSV(reader.result);
        $(modal_e.target).removeClass('disabled');
        $(modal_e.target).children("span").addClass('d-none');

        $("#applyCSVModal").modal('toggle');
      };
    }
  });

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

  $("#save-anyway").on("click", function(){
    $("#AlertModal").modal("toggle");
    generateAndDownloadTsv();
  });


  $("#moveClassesLeft").on("click", function(){
    _.each(svg.selectAll("text"), function(el){
      if (elementIsClass(el)){
        var x = el.getBBox().x;
        el.animate({x: x-25}, 500);
      }
    })
  });

  $("#moveClassesRight").on("click", function(){
    _.each(svg.selectAll("text"), function(el){
      if (elementIsClass(el)){
        var x = el.getBBox().x;
        el.animate({x: x+25}, 500);
      }
    })
  });

  $("#svg > svg").css({width: "50%"});

  function getTreeZoom(){
    return( 100 * parseFloat($("#svg > svg").css('width')) / parseFloat($("#svg > svg").parent().css('width')) );

  }

  $("#zoomIn").on("click", function(){
    var zoom = getTreeZoom();
    zoom += 10;
    $("#svg > svg").css({width: zoom+"%"});
  });

  $("#zoomFit").on("click", function(){
    $("#svg > svg").css({width: "100%"});
  });

  $("#zoomOut").on("click", function(){
    var zoom = getTreeZoom();
    zoom -= 10;
    $("#svg > svg").css({width: zoom+"%"});
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


});
