	var check;
	localStorage.setItem("check",1);
	var win_height = $(window).height();
	var nav_height = $(".nav_bar").height();
	$(".side_nav").css('height',(win_height-nav_height)+'px');
	var user_id;
	var src;
	var role_id;
	let post_id
	var offset=0;
    var offset1=0;
    var offset2=0;
    var n_id = [];
	$(document).on('click','.block_btn',function(){
		post_id = $(this).data("postid")
		src = $(this);
		if ($(this).hasClass( "block" )) {
			role_id = 2;
			$(".post_unblock_conform").hide();
			$(".post_block_conform").show();
			$("#block_post").modal('show')
		}else{
			$(".post_block_conform").hide();
			$(".post_unblock_conform").show();
			$("#block_post").modal('show')
			role_id = 1;
		}
	});
    $(document).on('click','.menu_admin',function(){
        $(".admin_notification").hide();
        $(".admin_menu").show();
    })
    $(".notification_admin").click(function(){

        localStorage.setItem("check",3);
        offset2 = 0;
        $(".list_notification").empty();
        $(".admin_menu").hide();
        var a = $(".menu_parent").find(".active")
        a.removeAttr("active");
		$(".notification_load").show();
		$(".notification_text").hide();		
        App.get_admin_notification(0)
		$(".admin_notification").show();
	
    })
    $(".logout").click(function(){
        App.logout();
    })
	$("#block_post_comfim").click(function(){
		App.block_post(post_id,role_id,src);
	});
	$(document).on('click','.check_user',function(){
		user_id = $(this).data("id");
        hasura_id = $(this).data("hasuraid");
		src = $(this);
		if ($(this).hasClass( "Unblock_active" )) {
			role_id = 1;
            status = true;
			$(".deactive_user_conform").hide();
			$(".active_user_conform").show();
			$("#deactivate_user").modal('show')
		}else{
			role_id = 2;
            status = false;
			$(".active_user_conform").hide();
			$(".deactive_user_conform").show();
			$("#deactivate_user").modal('show')
		}
	});
	$("#deactive").click(function(){
		App.deactivate_user(user_id,role_id,src,hasura_id,status)
        App.block_user(user_id,status,hasura_id)
	});
	$(document).on('click','.view',function(){
		if ($(this).hasClass( "titleview" )) {
			$(this).hide();
			$(".titleview_preview").hide()
			$(".load_image2").show()
            $(".listview").show()
			setTimeout(function () {
				$(".load_image2").hide()
				$(".listview_preview").show()
            }, 800)
		}else{
			$(this).hide();
			$(".listview_preview").hide()
			$(".load_image2").show()
            $(".titleview").show()
			setTimeout(function () {
				$(".load_image2").hide()
				$(".titleview_preview").show()
            }, 800)
		}
	});
	$(document).on('click','.cuser_management_bar',function(){
		$(".admin_notification").hide();
		var win_width = $(window).width();
		var win_height = $(window).height();
		console.log(win_height/2);
		var nav_width = $(".side_nav").width();
		var wid = $(window).width()-$(".side_nav").width();
		var wid1 = wid-$(".search_side1").width();
		$("").css('width',wid1+'px')
		var wid_hr = wid1-45;
		length_news();
		$(".hr_div").css('width',wid_hr+'px')
		window.scrollTo(0,0);
		localStorage.setItem("check",2);
		$(".user_management_details").empty();
		$(".loading_imag").show();
		App.get_allusers();		
	});
	$(document).on('click','.user_report',function(){
        $(".admin_notification").hide();
        var win_width = $(window).width();
        var win_height = $(window).height();
        console.log(win_height/2);
        var nav_width = $(".side_nav").width();
        var wid = $(window).width()-$(".side_nav").width();
        var wid1 = wid-$(".search_side1").width();
        $("").css('width',wid1+'px')
        var wid_hr = wid1-45;
        length_news();
        $(".hr_div").css('width',wid_hr+'px')
        window.scrollTo(0,0);
        localStorage.setItem("check",2);
        $(".user_reportusers").empty();
        $(".loading_imag").show();
        App.get_reportusers('','','');     
    });
	$(document).on('click','.cnewsfeed',function(){
		localStorage.setItem("check",1);
		offset = 0;
		window.scrollTo(0,0)
		length_news();
		$(".admin_notification").hide();
		$(".listview_preview").empty();
		$(".titleview_preview").empty();
		$(".load_image2").show();
		App.get_admin_newsfeed(0);
	});

	function length_news(){
		var win_width = $(window).width();
		var nav_width = $(".side_nav").width();
		$(".show_post").css('width',(win_width-nav_width)+'px');
		var wid = $(window).width()-$(".side_nav").width();
		var wid1 = wid-$(".search_side").width();
		var wid_hr = wid1-32;
		$(".hr_div").css('width',wid_hr+'px')
	}
	// App.get_allusers(0);
    function isURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    	return pattern.test(str);
    }
    function ValidURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater
        if (!pattern.test(str)) {
            // alert("Please enter a valid URL.");
            return false;
        } else {
            return true;
        }
    }
    $(document).on("click", ".image_preview", function () {
        var loc = $(this).attr('src');
        loc = loc.replace('url(', '').replace(')', '').replace(/\"/gi, "");
        $('#image_zoom').prop("src", loc);
        $("#image_modal").modal('show');
    });
    $(window).scroll(function () {
    	check = parseInt(localStorage.setItem("check",3));
    	if (check == 1) {
	        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
	            // var data_length = localStorage.getItem("homepage_length_data");
	            // if (data_length == "20") {
	                if ($(this).hasClass("user_management_details")) {
	                	offset1 = offset1 + 1;
	                	App.get_allusers(offset1);
	                }else{
	                	offset = offset + 1;
		                App.get_admin_newsfeed(offset);
	                }
	           	// }
	        }
    	}else if (check = 3) {
    		if ($(window).scrollTop() + $(window).height() == $(document).height()) {
	            offset2 = offset2 + 1;
		        // App.get_admin_notification(offset2);
	    	}
	    }
    });
    window.onscroll = function () { scrollFunction() };
    function scrollFunction() {
         if (document.body.scrollTop > 700 || document.documentElement.scrollTop > 700) {
            document.getElementById("myBtn").style.display = "block";
        } else {
            document.getElementById("myBtn").style.display = "none";
        }
    }
    $("#myBtn").click(function () {
        $('html').animate({ scrollTop: 0 }, 'slow'); return true;
    });
    $(document).on("click", ".notification_click", function () {
        $(".gif_image1").show(); 
        $(".border_radius").css('border-top-left-radius', '0px');
        $(".border_radius").css('border-top-right-radius', '0px');
        href = "#target_comment";
        var post_id_for_comment = $(this).data("id");
        // var notification_id = $(this).data("nid");
        $(".modal_parent_div").empty();
        $(".Comment_box").empty();
        var height_window1 = $(window).height();
        var set_height1 = height_window1 - 238;
        $("#comment_scroll").css('max-height', set_height1 + 'px');
        App.get_Post(post_id_for_comment);
        // n_id.push(notification_id)
        // App.readnotification(n_id,true);
        // $(this).parent().css('background-color','#efeeee')
        // $(this).parent().find(".notification_checkbox").attr("checked", "checked");
        n_id = [];
    });
    $(document).on('click','.notification_checkbox',function(){
    	if ($(this).prop("checked") == true){
    		$(this).parent().parent().css('background-color','#efeeee')
    		var notification_id = $(this).data("nid");
    		n_id.push(notification_id)
        	App.readnotification(n_id,true);
        	n_id = [];
        	// $(this).hide();
	    }else{
	    	$(this).parent().parent().css('background-color','white')
	    	var notification_id = $(this).data("nid");
    		n_id.push(notification_id)
        	App.readnotification(n_id,false);
        	n_id = [];
	    }
    })
    $(document).on("click", ".feed_comment_click", function () {
        $(".gif_image1").show();
        // $(".border_radius").css('border-top-left-radius', '0px');
        // $(".border_radius").css('border-top-right-radius', '0px');
        $(".modal_parent_div").empty();
        $(".Comment_box").empty();
        var pid = $(this).data("pid");
        var height_window1 = $(window).height();
        var set_height1 = height_window1 - 238;
        App.get_Post(pid);
        $("#comment_scroll").css('max-height', set_height1 + 'px');
    });
    $(document).on("click", ".like_count", function () {
    	$("#scroll_like").empty();
        $(".gif_image2").show();
        $(".like_border_radius").css('border-top-left-radius', '0px');
        $(".like_border_radius").css('border-top-right-radius', '0px');
        var postid_like = $(this).data("likepostid");
        App.get_likeduser(postid_like);
    });
    $(document).on("click", ".remove_comments", function () {
    	var cmdid = $(this).data("cmdid");
    	var status = false;
    	if ($(this).text()=='Hide Comment') {
    		status = true;
    		$(this).text("Show Comment");
    	}else{
    		status = false;
    		$(this).text("Hide Comment");
    	}
    	App.remove_comments(cmdid,status);
	});
	$(document).on('click','.reported_post',function(){
        $("#reported_user_info").empty();
        $("#repot_load").show();
        user_id = $(this).data("id");
		$("#reported_user").modal('show');
		App.report_user(user_id)

	});