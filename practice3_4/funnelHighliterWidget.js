Highlight3rdFunnel = function() {
    var widget = this;
    this.code = null;
    
    this.myvar = {};
    this.myfunc = function() {};
    
    this.bind_actions = function() {
    };
    
    this.render = function() {
      if (AMOCRM.data.current_entity === 'leads-pipeline') {
        var m1 = $(".pipeline_status:nth-of-type(1)").is(':visible') ? -1 : 0;
        $(".pipeline_status:nth-of-type(" + (4+m1) + ")").children().first().children().first().children().first().children().first()
           .css({background: $(".pipeline_status:nth-of-type(" + (4+m1) + ")").children().first().children().first().children().last().css('background-color')});
      }
    };
    
    this.init = function() {
    };
    
    this.bootstrap = function(code) {
      widget.code = code;
      
      var status = 1;
      
      if (status) {
        widget.init();
        widget.render();
        widget.bind_actions();
        $(document).on('widgets:load', function () {
          widget.render();
        });
      }
    }
};

yadroWidget.widgets['highlight-3rd-funnel'] = new Highlight3rdFunnel();
yadroWidget.widgets['highlight-3rd-funnel'].bootstrap('highlight-3rd-funnel');
