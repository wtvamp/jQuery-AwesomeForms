//# Awesome Forms Plugin

(function($){
    
    var methods = {
        init : function() {
        
            return this.each(function() {
                
                // Create the form object, which includes an array of pages and thumbnails.
                var $this = $(this);
                var arrayOfFormPages = [];
                var arrayOfThumbnails = [];
                // So that the form object can be used in other functions
                data = $this.data('form');

                // Create a container than can hold all the thumbnails
                $(this).before('<div id="thumbNails"></div>');              
    
                // For each of the pages on the form, which are seperated by divs
                // with the class of awesomePage
                $("fieldset").each(function(indexOfHTMLFormPage, valueOfHTMLFormPage) {
                    
                    // Initialize the array of form elements that will construct a form page.           
                    var arrayOfFormPageElements = [];
                    
                    // Go through the html page, and create the form elements based on the HTML
                    // then add these form elements to the array of form elements object
                    $(this).find('label').each(function(index, element) {
                        var formInputElement = new formElement($(this));
                        arrayOfFormPageElements.push(formInputElement);
                    });
                    
                    // Create a page object and a thumbnail object
                    var pageToForm = new formPage(arrayOfFormPageElements, $(this));
                    var thumbnailToForm = new formThumbNail($(this), indexOfHTMLFormPage);
        
                    // Push the page object and the thumbnail object onto the
                    // arrays that make up the form.
                    arrayOfThumbnails.push(thumbnailToForm);
                    arrayOfFormPages.push(pageToForm);
                    
                });
                
                // Create a new form object using the array of thumbnails and pages
                // which are created above.  
                newForm = new form(arrayOfFormPages, arrayOfThumbnails, this.id);
                
                $('#thumbNails').append('<div class="clearDiv"></div>');
                // If there is no data saved, then use the new form
                // to save data for use in other functions.
                if (!data ) {
                    $(this).data('form', newForm);
                }
                    
                // If the previous page button is clicked, go back a page.
                $('.prevForm').live('click', function() {
                    newForm.decreasePage();
                });
                
                // If the next page button is clicked, go forward a page.
                $('.nextForm').live('click', function() {
                    newForm.increasePage();
                });
                
                // If any of the thumbnails are clicked - go directly to that page.
                $('.pageThumbnail').live('click', function() {
                    // Get the index of the thumbnail that was clicked, and use
                    // that to determine the page number to go to.
                    var idToSplit = $(this).attr('id').split("thumb");
                    
                    newForm.goToPage(idToSplit[1], true);
                });
                
                
                // For every element in the form, as it is blurred, 
                // validate it and turn it red.
                $('input[type!="radio"]').blur(function() {
                        valid = $this.validate().element($(this));
                        if (valid === false) {
                            $(this).css('border','2px solid red');
                        }
                        else {
                            $(this).css('border','2px solid green');
                        }
                });
                
                
    
    
            });
        },
        hidePage : function( pageNumber ) { 
        // This method hides a page by calling the 
        // removePage method from the form object.
            var $this = $(this),
            newForm = $this.data('form');
            newForm.removePage(pageNumber); 
        },
        showPage : function( pageNumber ) { 
        // This method shows a page by calling the 
        // showPage method from the form object.
            var $this = $(this),
            newForm = $this.data('form');
            newForm.insertPage(pageNumber); 
        },
        goToPage : function( pageNumber ) { 
        // This method shows a page by calling the 
        // showPage method from the form object.
            var $this = $(this),
            newForm = $this.data('form');
            newForm.goToPage(pageNumber, true); 
        },
        validateForm: function () {
            var $this = $(this);
            newForm = $this.data('form');
            validForm = newForm.validateForm();
            return validForm;
        }
    };  
   
   
   
   
   
   
   
   
    $.fn.awesomeForm = function(method)
    {
        // This let's me use different methods in the plugin.  
        if ( methods[method] ) {
          return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
          return methods.init.apply( this, arguments );
        } else {
          $.error( 'Method ' +  method + ' does not exist on jQuery.awesomeForm' );
        }    

    };





        // The form object - this does the meat of the work
        var form = function form(pages, thumbnails, formID) {
            
            // Obviously a form consists of pages and thumbnails,
            // which are passed via two arrays.  Also get the number of 
            // pages (form length) from the length of the pages array.
            // The active pages becomes 0, or the first page.
            this.pages = pages;
            this.thumbnails = thumbnails;
            this.formLength = this.pages.length;
            this.activePageIndex = 0;
            this.formID = formID;
            
            // A new array of active thumbnails is created. 
            // This are the five thumbnails that are actively displayed 
            // to the user. They are pre-filled with the first five items
            // from the thumbnails array.
            this.activeThumbnails = [];
            this.activeThumbnails[0] = thumbnails[0];
            this.activeThumbnails[1] = thumbnails[1];
            this.activeThumbnails[2] = thumbnails[2];
            this.activeThumbnails[3] = thumbnails[3];
            this.activeThumbnails[4] = thumbnails[4];
            
            // Make the first page and the first thumbnail active
            this.pages[this.activePageIndex].makeActive();
            this.thumbnails[this.activePageIndex].makeActive();
            
            $.each(this.thumbnails, function(thumbnailIndex, thumbnailData) {
                if(thumbnailIndex > 4) {
                    this.hide();
                }
            });

        
            
            
            this.validateForm = function() {
                entireFormValid = true;
                tempThumb = this.thumbnails;
                formID = this.formID;
                $.each(this.pages, function(pageIndex, pageData) {
                    if (pageData !== null) {
                        if (this.formValidate(formID) === false) {
                            entireFormValid = pageIndex;
                            tempThumb[pageIndex].switchValid();
                            return false;
                        };
                    }
                });
                return entireFormValid;
            };
            
            
            
            // This function increases the form's active page by one.
            this.increasePage = function() {
                
                this.activePageIndex = parseInt(this.activePageIndex,10);
                // Keeps it from working beyond the last page.
                if (this.activePageIndex < (this.pages.length-1)) {
    
                    // Make the active thumbnail and page inactive
                    // (That means the thumbnail is no longer blue, 
                    // and the page becomes hidden.
                    this.pages[this.activePageIndex].makeInactive();
                    this.thumbnails[this.activePageIndex].makeInactive();
                    
                    // If the page is valid (all information is filled out 
                    // appropriately), then turn the page thumbnail green.
                    // Otherwise, if it is not valid, turn it red.
                    isPageValid = this.pages[this.activePageIndex].formValidate(this.formID);
                    if(isPageValid === false) {
                        this.thumbnails[this.activePageIndex].switchValid(false);
                    }
                    else {
                        this.thumbnails[this.activePageIndex].switchValid(true);
                    };
                    
                    
                    // If the active thumbnail is moving off of the middle thumbnail
                    // then this means all the pages need to be shifted.
                    if (this.activeThumbnails[2] === this.thumbnails[this.activePageIndex]) {
                        
                        // Get a local version of the active thumbnails for manipulating.
                        activeThumbs = this.activeThumbnails;

                        // Go through each of the thumbnails.  If they are not removed (value is null)
                        // then hide them.  Also, while going through the thumbnails, get the index
                        // of the thumbnail that is in the last position of the active thumbnails array.
                        $.each(this.thumbnails, function(activeIndex, activeData) {
                            if (activeData != null) {
                                this.hide();
                            };
                            
                            if (activeData === activeThumbs[4]) {
                                pageIndex = activeIndex;
                            };
                        });

                        // Shift each of the active thumbnails by one
                        // and pop the last active thumbnail off of the array.              
                        this.activeThumbnails[0] = this.activeThumbnails[1];
                        this.activeThumbnails[1] = this.activeThumbnails[2];
                        this.activeThumbnails[2] = this.activeThumbnails[3];
                        this.activeThumbnails[3] = this.activeThumbnails[4];
                        this.activeThumbnails.splice(4,1);
                        



                        // Go through each of the thumbnails to determine which
                        // is the next non-null thumbnail that should be added to
                        // the array.  Remember, null indexes are pages that have been
                        // removed, so they need to be skipped over, but their position
                        // is retained as null in case they are popped back in.
                        $.each(this.thumbnails, function(thumbIndex, thumbData) {   
                            // While the activeThumbs array is not full up to five thumbnails
                            // and the current thumbIndex in the loop is higher then the highest 
                            // page index determined above.
                            if (activeThumbs.length < 5 &&  thumbIndex > pageIndex) {                   
                                // As long as this is not a removed (null) thumbnail, push
                                // it onto the active array.
                                if (thumbData !== null) {
                                    activeThumbs.push(thumbData);
                                };
                            };
                        });
                        
                        // Make sure the new activeThumbnails objects match the local
                        // version that we have been manipulating.
                        this.activeThumbnails = activeThumbs;
                        // Go through each of the thumbnails and show them.  The undefined
                        // is necessary for when you reach the end of the array.
                        $.each(this.activeThumbnails, function(index, value) {
                            if (value != undefined) {
                                this.show();
                            }
                        });
                    };
    
    
                    // Increase the page and thumb index - this moves us to the next pages
                    while (this.pages[this.activePageIndex+1] == null) {
                        this.activePageIndex++;
                    }
                    this.activePageIndex++;
                    
                    activePageIndex = this.activePageIndex;
                                    
                    // Make the next page and thumbnail active - that is, 
                    // make the thumbnail blue, and the page show.
                    this.pages[this.activePageIndex].makeActive();
                    this.thumbnails[this.activePageIndex].makeActive(); 
                    
    
                    this.drawThumbPages(this.activePageIndex);
                        
                    
                            
                }
                
            }
    
    
    
            
            this.decreasePage = function() {

                // Keeps it from working beyond the last page.
                if (this.activePageIndex > 0) {
    
                    // Make the active thumbnail and page inactive
                    // (That means the thumbnail is no longer blue, 
                    // and the page becomes hidden.
                    this.pages[this.activePageIndex].makeInactive();
                    this.thumbnails[this.activePageIndex].makeInactive();
                    
                    // If the page is valid (all information is filled out 
                    // appropriately), then turn the page thumbnail green.
                    // Otherwise, if it is not valid, turn it red.
                    isPageValid = this.pages[this.activePageIndex].formValidate(this.formID);
                    if(isPageValid === false) {
                        this.thumbnails[this.activePageIndex].switchValid(false);
                    }
                    else {
                        this.thumbnails[this.activePageIndex].switchValid(true);
                    };
                    

                    pageIndex = this.pages.length;
                    
                    // If the active thumbnail is moving off of the middle thumbnail
                    // then this means all the pages need to be shifted.
                    if (this.activeThumbnails[2] === this.thumbnails[this.activePageIndex]) {
                        
                        // Get a local version of the active thumbnails for manipulating.
                        activeThumbs = this.activeThumbnails;
                        activePageIndex = this.activePageIndex;


                        // Reverse the thumbnails to move backwards.
                        var backThumbs = this.thumbnails.slice(0);
                        backThumbs = backThumbs.reverse();


                        // Go through each of the thumbnails.  If they are not removed (value is null)
                        // then hide them.  Also, while going through the thumbnails, get the index
                        // of the thumbnail that is in the first position of the active thumbnails array.
                        $.each(backThumbs, function(activeIndex, activeData) {
                            if (activeData != null) {
                                this.hide();
                            };
                            
                            if (activeData === activeThumbs[0]) {
                                pageIndex = activeIndex;
                            };
                        });
                        
                        
                        
                        if (pageIndex < (this.pages.length-1)) {
                            // Shift each of the active thumbnails by one
                            // and pop the first active thumbnail off of the array.             
                            this.activeThumbnails[4] = this.activeThumbnails[3];
                            this.activeThumbnails[3] = this.activeThumbnails[2];
                            this.activeThumbnails[2] = this.activeThumbnails[1];
                            this.activeThumbnails[1] = this.activeThumbnails[0];
                            this.activeThumbnails.splice(0,1);
                            
    
                            // Go through each of the thumbnails to determine which
                            // is the next non-null thumbnail that should be added to
                            // the array.  Remember, null indexes are pages that have been
                            // removed, so they need to be skipped over, but their position
                            // is retained as null in case they are popped back in.
                            $.each(backThumbs, function(thumbIndex, thumbData) {    
                                // While the activeThumbs array is not full up to five thumbnails
                                // and the current thumbIndex in the loop is higher then the highest 
                                // page index determined above.
                                if (activeThumbs.length < 5 &&  thumbIndex > pageIndex) {                   
                                    // As long as this is not a removed (null) thumbnail, push
                                    // it onto the active array.
                                    if (thumbData !== null) {
                                        activeThumbs.unshift(thumbData);
                                    };
                                };
                            });
                            
                        };
                        
                        // Make sure the new activeThumbnails objects match the local
                        // version that we have been manipulating.
                        this.activeThumbnails = activeThumbs;
                        // Go through each of the thumbnails and show them.  The undefined
                        // is necessary for when you reach the end of the array.
                        $.each(this.activeThumbnails, function(index, value) {
                            if (value != undefined) {
                                this.show();
                            };
                        });
                    };
                        
                        
    
                    // Increase the page and thumb index - this moves us to the next pages
                    while (this.pages[this.activePageIndex-1] == null) {
                        this.activePageIndex--;
                    }
                    this.activePageIndex--;
                    
                    
                                    
                    // Make the next page and thumbnail active - that is, 
                    // make the thumbnail blue, and the page show.
                    this.pages[this.activePageIndex].makeActive();
                    this.thumbnails[this.activePageIndex].makeActive();     
                    
                    this.drawThumbPages(this.activePageIndex);

                            
                }
                
            }
            
            
            
            this.goToPage = function(pageNum, validate) {
        
                // Make the active thumbnail and page inactive
                this.pages[this.activePageIndex].makeInactive();
                this.thumbnails[this.activePageIndex].makeInactive();

                if (validate === true) {
                // If the page is valid (all information is filled out 
                // appropriately), then turn the page thumbnail green
                isPageValid = this.pages[this.activePageIndex].formValidate(this.formID);
                    if(isPageValid === false) {
                        this.thumbnails[this.activePageIndex].switchValid(false);
                    }
                    else {
                        this.thumbnails[this.activePageIndex].switchValid(true);
                    };
                }
                        
                // Get a local version of the active thumbnails for manipulating.
                activeThumbs = this.activeThumbnails;
                $.each(activeThumbs, function(index, value) {
                    if (value != undefined) {
                        value.hide();
                    };
                });                     
                
                
                this.activePageIndex = pageNum;
                this.activeThumbnails[0] = null;
                this.activeThumbnails[1] = null;                        
                this.activeThumbnails[2] = null;
                this.activeThumbnails[3] = null;
                this.activeThumbnails[4] = null;
                    
                var realIndex = 0;
                var tempThumbs = this.thumbnails;
                var findLength = 0;
                $.each(this.thumbnails, function(activeIndex, activeData) {
                    if (activeData != null) {
                        findLength++        
                    };
                });
                
                found = false;
                $.each(this.thumbnails, function(activeIndex, activeData) {
                    if (activeData != null) {
                        if ((activeData === tempThumbs[pageNum]) && (realIndex===0) && (!found)) {
                            activeThumbs[0] = tempThumbs[pageNum];
                            activeThumbs[1] = null;
                            activeThumbs[2] = null;
                            activeThumbs[3] = null;
                            activeThumbs[4] = null;
                            found = true;
                        } else if ((activeData === tempThumbs[pageNum]) && (realIndex===1) && (!found)) {
                            activeThumbs[0] = null;
                            activeThumbs[1] = tempThumbs[pageNum];
                            activeThumbs[2] = null;
                            activeThumbs[3] = null;
                            activeThumbs[4] = null;
                            found = true;
                        } else if ((activeData === tempThumbs[pageNum]) && (realIndex===(findLength-2)) && (!found)) {
                            activeThumbs[0] = null;
                            activeThumbs[1] = null;
                            activeThumbs[2] = null;
                            activeThumbs[3] = tempThumbs[pageNum];
                            activeThumbs[4] = null;
                            found = true;
                        } else if ((activeData === tempThumbs[pageNum]) && (realIndex===(findLength-1))  && (!found)) {
                            activeThumbs[0] = null;
                            activeThumbs[1] = null;
                            activeThumbs[2] = null;
                            activeThumbs[3] = null;
                            activeThumbs[4] = tempThumbs[pageNum];
                            found = true;
                        };
                        realIndex++
                    };
                    
                });
    
                if (!found) {
                    activeThumbs[0] = null;
                    activeThumbs[1] = null;
                    activeThumbs[2] = tempThumbs[pageNum];
                    activeThumbs[3] = null;
                    activeThumbs[4] = null;
                };

                
                
                
                // Find out where the active thumbnail is in the active thumbs array
                newActiveIndex = $.inArray(this.thumbnails[this.activePageIndex], activeThumbs);

                // Go through the entire thumbnail array, and find the
                // next position, and the previous position
                $.each(this.thumbnails, function(activeIndex, activeData) {
                    if (activeData === activeThumbs[newActiveIndex]) {
                        rightPageIndex = activeIndex+1;
                        leftPageIndex = activeIndex-1;
                    };
                });

                
                // Countdown from the active thumbnail to the farthest left position
                // (which would be 0), and at each position, stop and loop through
                // each of the thumbnails from the left of the current thumb in the 
                // larger thumbnails array.  If it is not a null (removed page), then
                // go ahead and splice that thumbnail from the larger array onto the active array.
                for (i = newActiveIndex-1; i>=0; i--) {
                    for(j = leftPageIndex; j>=0; j--) {
                        if (this.thumbnails[j] != null) {
                            activeThumbs.splice(i,1,this.thumbnails[j]);
                            j = 0;
                        };
                        leftPageIndex--;
                    };
                };
                
                
                // Countdown from the active thumbnail to the farthest right position
                // (which would be 4), and at each position, stop and loop through
                // each of the thumbnails from the right of the current thumb in the 
                // larger thumbnails array.  If it is not a null (removed page), then
                // go ahead and splice that thumbnail from the larger array onto the active array.
                for (i = newActiveIndex+1; i<=4; i++) {
                    for(j = rightPageIndex; j<=this.pages.length; j++) {
                        if (this.thumbnails[j] != null) {
                            activeThumbs.splice(i,1,this.thumbnails[j]);
                            j = this.pages.length;

                        };
                        rightPageIndex++;
                    };
                };
                
    
                $.each(activeThumbs, function(index, value) {
                    value.show();
                });
                

                
                
                    
                // Make the prev page and thumbnail active
                this.pages[this.activePageIndex].makeActive();
                this.thumbnails[this.activePageIndex].makeActive(); 
                
                this.drawThumbPages(this.activePageIndex);

            
            };
            

            
            this.removePage = function(pageIndex) {
                
                // Remove all the DOM elements that are added in the insertPage function
                // This keeps them from being readded over and over.
                this.pages[pageIndex].pageHTML.find('.centerImageNav').remove();
                this.pages[pageIndex].pageHTML.find('.error').remove();
                this.pages[pageIndex].pageHTML.find('.clearErrorPadding').remove();
                this.pages[pageIndex].pageHTML.find('.clearInputPadding').remove();
                
                // Set the page in the array to null
                this.pages.splice(pageIndex,1, null);
                // Get the index of the thumbnail to be removed from the active thumbnails array
                var thumbToBeRemoved = this.thumbnails[pageIndex];
                // Set the thumbnail in the entire thumbnails array to null;
                this.thumbnails.splice(pageIndex,1, null);
                $('#thumb' + pageIndex).remove();

                // Get a local version of the active thumbnails for manipulating.
                activeThumbs = this.activeThumbnails;
                $.each(activeThumbs, function(index, value) {
                    value.hide();
                });             

                
                
                
                // Find out where the active thumbnail is in the active thumbs array
                newActiveIndex = $.inArray(this.activeThumbnails[this.activePageIndex], activeThumbs);

                // Go through the entire thumbnail array, and find the
                // next position, and the previous position
                $.each(this.thumbnails, function(activeIndex, activeData) {
                    if (activeData === activeThumbs[newActiveIndex]) {
                        rightPageIndex = activeIndex+1;
                        leftPageIndex = activeIndex-1;
                    };
                });

                
                // Countdown from the active thumbnail to the farthest left position
                // (which would be 0), and at each position, stop and loop through
                // each of the thumbnails from the left of the current thumb in the 
                // larger thumbnails array.  If it is not a null (removed page), then
                // go ahead and splice that thumbnail from the larger array onto the active array.
                for (i = newActiveIndex-1; i>=0; i--) {
                    for(j = leftPageIndex; j>=0; j--) {
                        if (this.thumbnails[j] != null) {
                            activeThumbs.splice(i,1,this.thumbnails[j]);
                            j = 0;
                        };
                        leftPageIndex--;
                    };
                };
                
                
                // Countdown from the active thumbnail to the farthest right position
                // (which would be 4), and at each position, stop and loop through
                // each of the thumbnails from the right of the current thumb in the 
                // larger thumbnails array.  If it is not a null (removed page), then
                // go ahead and splice that thumbnail from the larger array onto the active array.
                for (i = newActiveIndex+1; i<=4; i++) {
                    for(j = rightPageIndex; j<=this.pages.length; j++) {
                        if (this.thumbnails[j] != null) {
                            activeThumbs.splice(i,1,this.thumbnails[j]);
                            j = this.pages.length;

                        };
                        rightPageIndex++;
                    };

                };
    
                $.each(activeThumbs, function(index, value) {
                    value.show();
                });
                
                this.drawThumbPages(this.activePageIndex);
                this.goToPage(this.activePageIndex, false);
            };
            
            
            
            this.insertPage = function(pageIndex) {
                
                // Initialize the array of form elements that will 
                // construct the form page to be inserted
                var newArrayOfFormPageElements = [];


                $("#awesomeForm fieldset").eq(pageIndex).find('label').each(function(index, element) {
                    var newFormInputElement = new formElement($(this));
                    newArrayOfFormPageElements.push(newFormInputElement);
                });
                
                            
                // Get a local version of the active thumbnails for manipulating.
                activeThumbs = this.activeThumbnails;
                $.each(activeThumbs, function(index, value) {
                    value.hide();
                });
                
                pageHTML = $("#awesomeForm fieldset").eq(pageIndex);
                newPage = new formPage(newArrayOfFormPageElements, pageHTML);
                newThumb = new formThumbNail(pageHTML, pageIndex);
                newThumb.hide();
                
                this.pages.splice(pageIndex, 1, newPage);
                this.thumbnails.splice(pageIndex,1, newThumb);
                
                

                // Find out where the active thumbnail is in the active thumbs array
                newActiveIndex = $.inArray(this.thumbnails[this.activePageIndex], activeThumbs);

                // Go through the entire thumbnail array, and find the
                // next position, and the previous position
                $.each(this.thumbnails, function(activeIndex, activeData) {
                    if (activeData === activeThumbs[newActiveIndex]) {
                        rightPageIndex = activeIndex+1;
                        leftPageIndex = activeIndex-1;
                    };
                });

                
                // Countdown from the active thumbnail to the farthest left position
                // (which would be 0), and at each position, stop and loop through
                // each of the thumbnails from the left of the current thumb in the 
                // larger thumbnails array.  If it is not a null (removed page), then
                // go ahead and splice that thumbnail from the larger array onto the active array.
                for (i = newActiveIndex-1; i>=0; i--) {
                    for(j = leftPageIndex; j>=0; j--) {
                        if (this.thumbnails[j] != null) {
                            activeThumbs.splice(i,1,this.thumbnails[j]);
                            j = 0;
                        };
                        leftPageIndex--;
                    };
                };
                
                
                // Countdown from the active thumbnail to the farthest right position
                // (which would be 4), and at each position, stop and loop through
                // each of the thumbnails from the right of the current thumb in the 
                // larger thumbnails array.  If it is not a null (removed page), then
                // go ahead and splice that thumbnail from the larger array onto the active array.
                for (i = newActiveIndex+1; i<=4; i++) {
                    for(j = rightPageIndex; j<=this.pages.length; j++) {
                        if (this.thumbnails[j] != null) {
                            activeThumbs.splice(i,1,this.thumbnails[j]);
                            j = this.pages.length;

                        };
                        rightPageIndex++;
                    };

                };
    
                $.each(activeThumbs, function(index, value) {
                    value.show();
                });
                
                this.drawThumbPages(this.activePageIndex);
                this.goToPage(this.activePageIndex, false);
            };
            
            
            
            this.drawThumbPages = function(activePageIndex) {
                var fakeThumbPage = 0;
                var activeThumbs = this.activeThumbnails;
                // Go through each of the thumbnails, and draw the page number.
                // Hide the thumbnails that are greater than the first four.
                $.each(this.thumbnails, function(thumbnailIndex, thumbnailData) {
                    if (thumbnailData != null) {
                        fakeThumbPage++;
                    };
                    if (thumbnailData!=null) {
                        this.drawPageNumber(fakeThumbPage);
                    };
                });
            

                // Get a local formLength to use inside the
                // each loop.  This goes through each page
                // and draws a number on it.  Even the ones that aren't displayed.
                var fakeFormLength = 0;
                $.each(this.pages, function(pageIndex, pageData) {
                    if (pageData != null) {
                        fakeFormLength++;
                    };
                });
                
                var fakePage = 0;
                $.each(this.pages, function(pageIndex, pageData) {
                    if (pageData != null) {
                        fakePage++;
                    };
                    if (pageIndex === parseInt(activePageIndex,10)) {
                        this.drawFormPageNumber(fakePage, fakeFormLength);
                    };
                });
            
            };
            
            
            
            this.drawThumbPages(this.activePageIndex);

            
        };







        var formPage = function formPage(formElements, pageHTML) {
            this.formElements = formElements;
            this.isActive = false;
            this.isPageValid = false;
            this.pageHTML = pageHTML;
            this.pageHTML.append('<div class="centerImageNav"><img src="menu_left.png" class="prevForm" width="25" height="24" alt="left menu arrow" /><span class="centerImageNavText">Page <span class="currentPageNumber"></span><span>&nbsp;of&nbsp;</span><span class="totalLength"></span>                            </span>                            <img src="menu_center.png" style="margin-left:-4px;" width="138" height="24" alt="center of menu" />                            <img src="menu_right.png" class="nextForm" style="margin-left:-4px;" width="27" height="24" alt="right menu arrow" /></div>');  
            this.pageHTML.hide();
            
            this.formValidate = function(formID) {
                attemptValidPage = true;
                jQuery.each(this.formElements, function(formElementIndex, formElementValue) {
                    if(this.validateFormElement(formID)===false) {
                        attemptValidPage = false;
                    };
                });
                this.isPageValid = attemptValidPage;
                return this.isPageValid;
            };
            
            this.makeActive = function() {
                this.pageHTML.show();
                this.isActive = true;
            };
            
            this.makeInactive = function() {
                this.pageHTML.hide();
                this.isActive = false;
            };
            
            this.drawFormPageNumber = function(formPageNumber, totalPages) {
                this.pageHTML.find(".currentPageNumber").html(formPageNumber);
                this.pageHTML.find(".totalLength").html(totalPages);
            };
            
        };







        var formElement = function formElement(label) {
            // Move the label to the left
            this.label = label
            this.label.css("float","left");
            this.label.css("width","180px");
            
            // Create a clone of the label for the error message
            // that might come back from the validator plugin
            error = this.label.clone();
            error.addClass("error");
            error.attr("generated","true");
            error.html("");
            
            // Format the input box to the right.       
            this.inputType = label.next();
            
            isTextArea = (this.inputType.is('textarea'));
            if (isTextArea === true) {
                this.inputType.css("float","left");
                this.inputType.css("width","100%");             
            }
            else {
                this.inputType.css("float","right");
                this.inputType.css("width","180px");
            };
            
            
            // Add the error after the input
            this.inputType.after(error);
            
            // Add a clear after the input.  
            this.inputType.after('<div class="clearInputPadding"></div>');
            
            // Add a clear after the error
            error.after('<div class="clearErrorPadding"></div>');

            this.valid = null;
            this.show = true;
            
            this.validateFormElement = function(formID) {
                var isRadioDiv = this.inputType.is('div');
                var isClearClasses = (this.inputType.is('.clearErrorPadding') || this.inputType.is('.clearInputPadding'));
                if (isRadioDiv === true && isClearClasses === false) {
                    this.valid = $("#" + formID).validate().element(this.inputType.children(":first"));
                    /*if (this.valid === false) {
                        var realError = (this.inputType.children(":first").next());
                        errorMessage = realError.html();
                        realError.parent().next().find(".newError").html(errorMessage);
                        realError.hide();
                    }*/
                }
                else if (isClearClasses === false) {
                    this.valid = $("#" + formID).validate().element(this.inputType);
                    /*if (this.valid === false) {
                        var realError = (this.inputType.next());
                        errorMessage = realError.html();
                        realError.next().find(".newError").html(errorMessage);
                        realError.hide();
                    }*/
                }
            
                return (this.valid);
            };
        };
        
        
        
        
        
        
        
        var formThumbNail = function formThumbNail(awesomePage, pageIndex) {
            
            // Create a copy of the page and then shrink it down into a thumbnail version
			this.pictureContent = awesomePage.clone();
            this.pictureContent.css('display','block');
			this.pictureContent.css('width','80px');
            this.pictureContent.css('height','100px');
            this.pictureContent.css('overflow','hidden');
            this.pictureContent.css('margin-left','auto');
            this.pictureContent.css('margin-right','auto');
            this.pictureContent.css('border','none');
            this.pictureContent.find('legend').css('font-size','4px');
            this.pictureContent.find('label').css('font-size','4px');
            this.pictureContent.find('label').css('width','45px');
            this.pictureContent.find('.clearInputPadding').css('padding-bottom','2px');
            this.pictureContent.find('.clearErrorPadding').remove();
            this.pictureContent.find('label').attr('id',this.pictureContent.find('select').attr('id') + "thumb");
            this.pictureContent.find('div').css('width','25px');
            this.pictureContent.find('div').css('line-height','2px');
            this.pictureContent.find('select').css('width','25px');
            this.pictureContent.find('select').css('height','5px');
            this.pictureContent.find('select').attr('disabled','disabled');
            this.pictureContent.find('select').attr('id',this.pictureContent.find('select').attr('id') + "thumb");
            this.pictureContent.find('input').attr('id',this.pictureContent.find('input').attr('id') + "thumb");
            this.pictureContent.find('label').css('line-height','5px');
            this.pictureContent.find('input').css('width','25px');
            this.pictureContent.find('input').attr('disabled','disabled');
            this.pictureContent.find('input').css('height','5px');
            this.pictureContent.find(':radio').css('width','0px');
            this.pictureContent.css("font-size","4px");
            this.pictureContent.find('.newError').hide();
            this.pictureContent.find('.centerImageNav').remove();
            this.pictureContent.find('.newError').parent().css('padding-bottom','0px');

            thumbToAdd = this.pictureContent;
            if (awesomePage.index() > 0) {
                $('.pageThumbnail').each(function(index, element) {
                    thumbID = $(this).attr('id').split('thumb');
                    if (awesomePage.index() > parseInt(thumbID[1])) {
                        $('#thumb' + thumbID[1]).after(thumbToAdd);
                    }
                });
            }
            else {
                $('#thumbNails').append(thumbToAdd);
            };
			
			thumbToAdd.wrap("<div></div>");
			this.picture = thumbToAdd.parent();
	        this.picture.css('width','93px');
            this.picture.css('height','120px');
            this.picture.css('overflow','hidden');
            this.picture.css('display','inline');
            this.picture.css('float','left');
            this.picture.addClass("pageThumbnail");
            //this.picture.removeClass("awesomePage");
            this.picture.attr('id','thumb' + pageIndex);
            this.picture.append('<div class="thumbPageNum">0</div>');		
        
            // Create the variable that says if the thumbnail is active,
            // and an indicator variable for if the page is valid.
            this.isActive = false;
            this.isValidGlow = false;
            
            this.makeActive = function() {
                this.isActive = true;
                this.picture.css("height", "129px");
                this.picture.css("width", "103px");
                this.picture.css("-webkit-box-shadow","10px 10px 5px #000");
                this.picture.css("box-shadow","10px 10px 5px #000");
                this.picture.css("moz-box-shadow","10px 10px 5px #000");
                this.picture.css("margin-top","-6px");
                this.picture.css("filter","progid:DXImageTransform.Microsoft.Shadow(color='#000000', Direction=135, Strength=10);");
            };
            
            this.makeInactive = function () {
                this.isActive = false;
                this.picture.css("height", "120px");
                this.picture.css("width", "93px");
                this.picture.css("-webkit-box-shadow","2px 2px 3px #000");
                this.picture.css("box-shadow","2px 2px 3px #000");
                this.picture.css("moz-box-shadow","2px 2px 3px #000");
                this.picture.css("margin-top","0px");
                this.picture.css("filter","progid:DXImageTransform.Microsoft.Shadow(color='#000000', Direction=135, Strength=3);");
            };
            
            this.switchValid = function(switchValue) {
                this.isValidGlow = switchValue;
                if (this.isValidGlow === true) {
                    this.picture.css("border", "3px solid green");
                } else {
                    this.picture.css("border", "3px solid red");
                }
            };
            
            this.show = function() {
                this.picture.show();
            };
            
            this.hide = function() {
                this.picture.hide();
            };
            
            this.drawPageNumber = function(pageNumber) {
                this.picture.find('.thumbPageNum').html(pageNumber);
            };
            
            
        };
   
})(jQuery);




