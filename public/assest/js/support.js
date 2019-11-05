$(document).on('click','.csupport',function(){
	$("#supports").empty();
    $(".loading_imag").show();
	App.get_supports();
	localStorage.setItem("check",6)	
});