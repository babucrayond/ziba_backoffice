$(document).on('click','.cfeedback',function(){
	$("#feedbacks").empty();
    $(".loading_imag").show();
	App.get_feedbacks();
	localStorage.setItem("check",5)
});