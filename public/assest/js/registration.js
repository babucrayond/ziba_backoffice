$(document).on('click','.cregistration',function(){
    $("#table_data").empty();
    $(".loading_imag").show();
	localStorage.setItem("check",7)
	App.register_list("","","","","");
});
$(document).on('click','.unverifyusers',function(){
    $("#table_data1").empty();
    $(".loading_imag").show();
    localStorage.setItem("check",7)
    App.unverify_users();
});
$(document).on('click','.apply_filter',function(){
    $("#table_data").empty();
    $(".loading_imag").show();
    var sDate = $('.date_re_start').val();
    if(sDate == ''){
    var startDate = ""; 
    }else{        
    var startDate = new Date(sDate).toISOString();
    }

    var eDate = $('.date_re_end').val();
    if(eDate == ""){
    var endDate = "";
    }else{
    date = new Date(eDate);
    var endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()+1,  date.getHours(), date.getMinutes(), date.getSeconds())).toISOString();    
    }


    var verifiedStatus = $('.registeredStatus').val();
    var userStatus = $('.userStatus').val();
    var Platform = $('.Platform').val();
	localStorage.setItem("check",7)
	App.register_list(Platform, startDate, endDate, verifiedStatus, userStatus);
}); 