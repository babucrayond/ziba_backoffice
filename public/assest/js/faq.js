var count_faq = 3;
$(document).on('click','.cfaq',function(){
	$(".new_faq").empty();
    $(".loading_imag").show();
	App.get_faq();
	$(".admin_notification").hide();
	localStorage.setItem("check",4)
})	
$("#add_new_faq").click(function(){
          App.add_faq(1,$(".add_question").val(),$(".add_answer").val(),0);
          $(".add_question").val("")
          $(".add_answer").val("")
})
var edit_faq_id;
$(document).on('click','.edit_faqs',function(){
	edit_faq_id = $(this).parent().data("id");
	$(".edit_question").val($(this).parent().find(".title"+edit_faq_id).text());
	$(".edit_answer").val($(this).parent().find(".content"+edit_faq_id).text());
})
$("#edit_new_faq").click(function(){
	// $(".title"+edit_faq_id).text($(".edit_question").val());
	// $(".content"+edit_faq_id).text($(".edit_answer").val());
	App.add_faq(2,$(".edit_question").val(),$(".edit_answer").val(),edit_faq_id)

})
var delete_faq;
$(document).on('click','.delete_faq',function(){
	delete_faq = $(this).parent().data("id");
   
});
$("#delete_faq").click(function(){
	var src = $(this).parent().parent();
    console.log(delete_faq)
	App.add_faq(3,"","",delete_faq,src)
});