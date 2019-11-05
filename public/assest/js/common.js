var roles = 3;
var type_post = 0;
var type_user = 0;
$('.search_display').keyup(function (e) {
	if (e.which == 13) {
		App.get_admin_newsfeed(0,$(this).val(),$(".search_text1").val(),type_post);
	}
});
$('.search_text1').keyup(function (e) {
	if (e.which == 13) {
		App.get_admin_newsfeed(0,$(".search_display").val(),$(this).val(),type_post);
	}
});
$('.search_text').keyup(function (e) {
	if (e.which == 13) {
		App.get_allusers(roles,$(this).val(),type_user);
	}
});
$("input[type='radio']").click(function(){
    var roles = $("input[name='roles']:checked").val();
	App.get_allusers(roles,$(".search_text").val(),type_user);
});
$(".show_type").click(function(){
   	$(".show_type_user").toggle();
});
$(".showtype_post").click(function(){
   	$(".show_type_post").toggle();
});
$(document).on("click", function (e) {
    if ($(e.target).is(".show_type") === false) {
    	$(".show_type_user").hide();
    }
    if ($(e.target).is(".showtype_post") === false) {
    	$(".show_type_post").hide();
    }
});
$(document).on("click",".select_role", function (e) {
   type_user = $(this).data("id");
   $(".set_user").text($(this).data("type"))
   App.get_allusers(roles,$(".search_text").val(),type_user);
});
$(document).on("click",".select_type_post", function (e) {
   type_post = $(this).data("id");
   $(".set_type").text($(this).data("type"))
   App.get_admin_newsfeed(0,$(".search_display").val(),$(".search_text1").val(),type_post);
});
if (localStorage.getItem("login_role") != "admin") {
  window.location.replace("/");
}
$(document).on("click",".show_reported_comments",function(){
  $(this).hide();
  $(".show_all_comments").show();
  $(".show_comments").empty();
  $(".show_comments_load").show();
  App.reported_comments($(this).data("postid"))
});
$(document).on("click",".show_all_comments",function(){
  $(this).hide();
  $(".show_reported_comments").show();
  $(".show_comments").empty();
  $(".show_comments_load").show();
  App.get_show_comments($(this).data("postid"))

});