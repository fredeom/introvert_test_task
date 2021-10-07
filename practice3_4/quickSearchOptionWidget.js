QuickSearchOptionIntr = function() {
    var widget = this;
    this.code = null;
    
    this.myvar = {};
    this.myfunc = function() {};
    
    this.bind_actions = function() {
      if (AMOCRM.data.current_entity === 'contacts') {
        $(".card-cf-actions-tip").find('[data-type="google"]').click(function() {
          const searchString = $(this).parent().parent().parent().children().first().find("input:last").first().val();
          window.open("https://yandex.ru/search/?text=" + searchString, "_blank");
          window.open("http://letmegooglethat.com/?q=" + searchString, "_blank");
        });
      }
    };
    
    this.render = function() {
    };
    
    this.init = function() {
      if (AMOCRM.data.current_entity === 'contacts') {
        $(".card-cf-actions-tip").each(function() {
          $(this).children().first().append(
            $('<div class="tips-item js-tips-item js-cf-actions-item " data-type="google" data-id="" data-forced="" data-value=""><span class="tips-icon icon icon-inline icon-search-cancel"></span> Нагуглить </div>')
          );
        });
      }
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

yadroWidget.widgets['quick-search-option-intr'] = new QuickSearchOptionIntr();
yadroWidget.widgets['quick-search-option-intr'].bootstrap('quick-search-option-intr');
