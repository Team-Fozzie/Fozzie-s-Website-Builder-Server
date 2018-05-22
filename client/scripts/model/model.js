var app = app || {};

(function(module) {
  function Project(project_id, name){
    this.name = name;
    this.project_id = project_id;
    this.allSections = [];
  }
  function Section(order, body){
    this.order = order;
    this.body = body;
  }
  function User(username, email, user_id) {
    this.username = username;
    this.email = email;
    this.user_id = user_id;
  }

  Project.prototype.renderAll = function(startElement, currentlySelected) {
    $(startElement).empty();
    this.sortAll();
    this.allSections.forEach((e, i) => {
      if (i === currentlySelected){
        let template = Handlebars.compile($('#current-selection-template'));
        $(startElement).append(template(this));
        $('section.currently-selected').append(e.render());
      }
      else {
        console.log('Are we getting HERE?')
        $(startElement).append(e.render());
      }
    })
  }

  Section.prototype.render = function (){
    var template = Handlebars.compile($('#section-template').text());
    return template(this);
  }

Project.prototype.updateProject = function(callback){
  let htmlArr = [];
  this.allSections.forEach(e => htmlArr.push(e.body));
  let htmlStr = JSON.stringify(htmlArr);
  $.ajax({
      url: `${ENV.apiUrl}/app/data/${this.project_id}`,
      method: 'PUT',
      data: { html: htmlStr }
  })
      .then(callback);
}

Project.prototype.getProject = function(callback) {
  $.get(`${ENV.apiUrl}/app/project/${this.project_id}`)
      .then(results => {
          if(results[0].html) {
            let htmlArr = JSON.parse(results[0].html);
            console.log(htmlArr);
            app.project.allSections = htmlArr.map((e, i) => {
              return new Section(i, e)
            })
          }
          console.log('this', this);
          console.log(this.allSections);
      })
      .then(callback)
      .catch(console.error);
}

  module.Section = Section;
  module.Project = Project;
  module.User = User;


  Project.prototype.sortAll = function() {
    this.allSections.sort( (a,b) => a.order-b.order);
  }

})(app);



