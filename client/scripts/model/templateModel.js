'use strict';

var app = app || {};

(function(module) {

  var templates = {};

  templates.header = Handlebars.compile($('#header-template').text());

  templates.template1 = Handlebars.compile($('#template-one').text());
  templates.template2 = Handlebars.compile($('#template-two').text());
  templates.template3 = Handlebars.compile($('#template-three').text());
  templates.template4 = Handlebars.compile($('#template-four').text());
  templates.template5 = Handlebars.compile($('#template-five').text());
  templates.template6 = Handlebars.compile($('#template-six').text());
  templates.template7 = Handlebars.compile($('#template-seven').text());

  templates.editSection = Handlebars.compile($('#edit-section-list').text());

  templates.templateToHtml = function(templateNum, body) {
    return this[templateNum](body);
  };

  module.templates = templates;

})(app);