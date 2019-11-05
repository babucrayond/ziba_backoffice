var App = (function() {
  var auth = "https://auth.zibahub.net/v1";
  var base = "https://api.zibahub.net";
  var template = "http://data.zibahub.net/v1/template";
  var auth_token, hasura_id, user_id;
  return {
    relative_time: function(date_str) {
      if (!date_str) {
        return;
      }
      date_str = $.trim(date_str);
      date_str = date_str.replace(/\.\d\d\d+/, ""); // remove the milliseconds
      date_str = date_str.replace(/-/, "/").replace(/-/, "/"); //substitute - with /
      date_str = date_str.replace(/T/, " ").replace(/Z/, " UTC"); //remove T and substitute Z with UTC
      date_str = date_str.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2"); // +08:00 -> +0800
      var parsed_date = new Date(date_str);
      var relative_to = arguments.length > 1 ? arguments[1] : new Date(); //defines relative to what ..default is now
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
      delta = delta < 2 ? 2 : delta;
      var r = "";
      if (delta < 60) {
        r = delta + " Secs Ago";
      } else if (delta < 120) {
        r = "A Min Ago";
      } else if (delta < 45 * 60) {
        r = parseInt(delta / 60, 10).toString() + " Mins Ago";
      } else if (delta < 2 * 60 * 60) {
        r = "An Hour Ago";
      } else if (delta < 24 * 60 * 60) {
        r = "" + parseInt(delta / 3600, 10).toString() + " Hours Ago";
      } else if (delta < 48 * 60 * 60) {
        r = "A Day Ago";
      } else {
        r = parseInt(delta / 86400, 10).toString() + " Days Ago";
      }
      return r;
    },
    urlify: function(text) {
      var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
      return text.replace(urlRegex, function(url, b, c) {
        var url2 = c == "www." ? "http://" + url : url;
        return '<a href="' + url2 + '" target="_blank">' + url + "</a>";
      });
    },
    hashcheck: function(text) {
      var urlRegex = /(((#\/\/)|(#))[^\s]+)/g;
      return text.replace(urlRegex, function(url, b, c) {
        return '<span style="color:blue">' + url + "</span>";
      });
    },
    nextline: function(text) {
      var urlRegex = /[\r\n]/g;
      return text.replace(urlRegex, function(url, b, c) {
        return "</br>";
      });
    },
    login: function(username, password) {
      var user_data = {
        provider: "email",
        data: {
          email: username,
          password: password
        }
      };
      jQuery.ajax({
        url: auth + "/login",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(user_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          localStorage.setItem("auth_token", data.auth_token);
          localStorage.setItem("hasura_id", data.hasura_id);
          // App.get_details(data.hasura_id,data.auth_token,data.hasura_roles[1]);
          debugger
          console.log(data.hasura_roles.includes("admin"))
          if (data.hasura_roles.includes("admin")) {
              localStorage.setItem("login_role", "admin");
              window.location.replace("/home_page");
            }
        },
        error: function(jqXhr, textStatus, errorThrown) {
          $("#login").attr("disabled", false);
          $("#login").text("Log In");
          $("#login").css("padding-left", "107px");
          $("#login").css("padding-right", "107px");
          App.error_alert("Invalid Credentials");
        }
      });
    },
    // get_details: function (hasura_id, auth_token,user_role) {
    //   var input_data = {
    //       "hasura_id": parseInt(hasura_id)
    //   }
    //   jQuery.ajax({
    //       url: base + '/get_hasura_profile',
    //       dataType: "json",
    //       type: "POST",
    //       contentType: 'application/json',
    //       headers: {
    //           "Authorization": "Bearer " + auth_token
    //       },
    //       data: JSON.stringify(input_data),
    //       crossDomain: true,
    //       processData: false,
    //       success: function (data, textStatus, jQxhr) {
    //         localStorage.setItem('user_name',data[0].user_name);
            
    //       },
    //       error: function (jqXhr, textStatus, errorThrown) {
    //       }
    //     });
    // },
    logout: function() {
      jQuery.ajax({
        url: auth + "/user/logout",
        dataType: "json",
        type: "POST",
        headers: {
          contentType: "application/json",
          Authorization: "Bearer " + localStorage.getItem("auth_token")
        },
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          localStorage.clear();
          window.location.replace("/");
        },
        error: function(jqXhr, textStatus, errorThrown) {
          App.error_alert("something went wrong");
        }
      });
    },
    sucess_alert: function(message) {
      var notify = $.notify(message, "success");
    },
    error_alert: function(message) {
      var notify = $.notify(message, "error");
    },
    info_alert: function(message) {
      var notify = $.notify(message, "info");
    },
    get_admin_newsfeed: function(offset, display_name, text, post_type) {
      var input_data = {
        pageoffset: parseInt(offset),
        search_text: text,
        display_name: display_name,
        post_type: post_type
      };
      jQuery.ajax({
        url: base + "/get_admin_newsfeed",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".listview_preview").empty();
          $(".titleview_preview").empty();
          if (data.length != 0) {
            localStorage.setItem("homepage_length_data", data.length);
            jQuery.each(data, function(index, value) {
              var profile_pic = value.user_profile.profile_pic;
              if (
                profile_pic == "" ||
                profile_pic == null ||
                profile_pic == "null"
              ) {
                profile_pic = "assest/images/user.png";
              }
              html = `<div class="col-md-4" style="padding-top: 21px;">
                            <div class="col-md-12 shadow" style="padding: 9px 0 11px 0;">
                                <div class="col-md-12" style="padding: 0">
                                    <div class="col-md-2" style="width: 45px">
                                        <img src="${profile_pic}" style="width: 46px;border-radius: 31px;height: 46px;">
                                    </div>
                                    <div class="col-md-10" style="padding-top: 4px;padding-left: 22px;">
                                        <span class="display_name_newsfeed">${
                                          value.user_profile.display_name
                                        }</span>`;
              if (value.is_active == true) {
                if (value.status == 2) {
                  html += `<button class="unblock block_btn" style="outline:none" data-postid = "${
                    value.id
                  }">Add</button><br>`;
                } else {
                  html += `<button class="block block_btn" style="outline:none" data-postid = "${
                    value.id
                  }">Remove</button><br>`;
                }
              } else {
                html += `<span style="outline:none;color:#485be4;float: right;margin-top: 6px;">Deleted</span><br>`;
              }
              html += `<span style="">${App.relative_time(value.created_at)} `;
              // <img src="assest/images/world.png" style="width: 12px;">
              if (value.is_public) {
                html +=
                  '<img class="privateorpublic" src="assest/images/world.png" style="width:12px;opacity: 0.6;">';
              } else {
                html +=
                  '<img class="privateorpublic" src="assest/images/Private.png" style="width:12px;opacity: 0.6;">';
              }
              html += `</span>
                                    </div>
                                </div>
                                <div class="col-md-12" style="padding-top: 7px;height: 43px;word-wrap: break-word;">`;

              content = value.post_content;
              var hash_text = App.urlify(content);
              html += App.hashcheck(hash_text);

              html += `</div>
                                <div class="col-md-12" style="height: 204px;padding-left:0;padding-right:0;text-align: center;background-color: #b9b9b9;margin-top: 8px;">`;
              if (value.redirection_url) {
                html += `<img class="image_preview" src="${
                  value.redirection_url
                }" style="max-width: 309px;height: 204px;cursor:pointer">`;
              } else {
                if (value.url_content) {
                  if (value.url_content.hasOwnProperty("canonicalurl")) {
                    if (value.url_content.canonicalurl) {
                      html +=
                        '<a href="' +
                        value.url_content.url +
                        '" target="_blank"><div class="col-md-12" id="url_div" style="border: 1px solid #dcdbdb;background-color: #EEEEEE;padding-right: 0;padding-left: 0;padding-top:18px;">' +
                        '<div class="col-md-12" style="padding-left: 0;">' +
                        '<img  src="' +
                        value.url_content.imageurl +
                        '"  style="width: 272px;height: 97px;object-fit: contain;">' +
                        "</div>" +
                        '<div class="col-md-12" style="padding-right: 0;padding-top: 10px;padding-left: 6px;">' +
                        "<div>" +
                        '<b><p style="font-weight: 600px;color:black;text-align: left;">' +
                        value.url_content.title +
                        "</p></b>" +
                        '<p  style="opacity: 0.8;color:black;padding-right: 15px;text-align: left;line-height: 1.5em;height: 2em;overflow: hidden;    white-space: nowrap;text-overflow: ellipsis;">' +
                        value.url_content.description +
                        "</p>" +
                        "</div>" +
                        "</div>" +
                        "</div></a>";
                    } else {
                    }
                  } else {
                  }
                } else {
                }
              }
              html += `</div>
                            <div class="col-md-12" style="padding-top: 6px">
                                <span class="like_count" data-toggle="modal" data-target="#list_of_user" style="font-size: 15px;cursor:pointer" data-likepostid="${
                                  value.id
                                }">${value.like_count} likes</span>
                                <span class="feed_comment_click" data-toggle="modal" data-target="#post_show" style="padding-left: 4px;font-size: 15px;cursor:pointer;" data-pid = "${
                                  value.id
                                }">${value.comments_count} comment</span>`;
              if (value.reports.length > 0) {
                html += `<span class="feed_comment_click" data-toggle="modal" data-target="#post_show" style="float:right;padding-left: 7px;cursor:pointer;" data-pid = "${
                  value.id
                }"> ${
                  value.reports.length
                } Reported</span><img src="assest/images/danger.png" style="width: 20px;float:right;height:20px"/>`;
              }
              html += `</div>
                            </div>
                        </div>`;
              $(".titleview_preview").append(html);
            });
            jQuery.each(data, function(index, value) {
              var profile_pic = value.user_profile.profile_pic;
              if (
                profile_pic == "" ||
                profile_pic == null ||
                profile_pic == "null"
              ) {
                profile_pic = "assest/images/user.png";
              }
              html = `<div class="col-md-12" style="padding: 10px 0 0 0;"><div class=" col-md-12 shadow" style="padding-top:0;padding-bottom: 0;padding-right: 0;top: 0;">
                            <div class="col-md-1" style="padding: 10px 0 10px 0;background-color: #b9b9b9;height:76px;">`;
              if (value.redirection_url) {
                html += `<img class="image_preview" src="${
                  value.redirection_url
                }" style="width: 82px;height: 56px;">`;
              } else {
                if (value.url_content) {
                  if (value.url_content.hasOwnProperty("canonicalurl")) {
                    if (value.url_content.canonicalurl) {
                      html += `<img class="image_preview" src="${
                        value.url_content.imageurl
                      }" style="width: 82px;height: 56px;">`;
                    } else {
                    }
                  } else {
                  }
                } else {
                }
              }
              html += `</div>
                            <div class="col-md-5" style="padding: 10px 0 10px 11px">`;

              content = value.post_content;
              var hash_text = App.urlify(content);
              html += App.hashcheck(hash_text);
              html += `</div>
                            <div class="col-md-2" style="padding:10px 0 10px 0">
                                <span class="like_count" data-toggle="modal" data-target="#list_of_user" style="cursor:pointer;" data-likepostid=${
                                  value.id
                                }>${value.like_count} Likes</span>`;
              if (value.reports.length > 0) {
                html += `<span style="float:right;padding-left: 2px;padding-top: 14px;"> ${
                  value.reports.length
                } users</span><img src="assest/images/danger.png" style="width: 17px;float:right;padding-top: 15px;"/>`;
              }
              html += `<p class="feed_comment_click" data-toggle="modal" data-target="#post_show" style="margin-bottom: 0;margin-top: 10px;cursor:pointer;" data-pid = ${
                value.id
              }>${value.comments_count} comments</p>
                            </div>
                            <div class="col-md-1" style="padding: 17px 0 10px 0;">`;
              if (value.is_active == true) {
                if (value.status == 2) {
                  html += `<button class="unblock">Add Post</button>`;
                } else {
                  html += `<button class="block">Remove Post</button>`;
                }
              } else {
                html += `<span style="outline:none;color:#485be4;float: right;margin-top: 6px;">Deleted</span><br>`;
              }
              html += `</div>
                            <div class="col-md-3" style="padding-right: 0;">
                                <div class="col-md-12" style="background-color: #EAEAEA;padding:0;padding-top: 9px;padding-bottom: 21px;">
                                    <div class="col-md-2" style="width: 59px">
                                        <img src="${profile_pic}" style="width: 46px;border-radius: 31px;height: 46px;">
                                    </div>
                                    <div class="col-md-10" style="width: 154px;padding-left:19px;top: 7px;">
                                        <span style="font-weight: 700">${
                                          value.user_profile.display_name
                                        }</span><br>
                                        <span>${App.relative_time(
                                          value.created_at
                                        )} </span>`;
              if (value.is_public) {
                html +=
                  '<img class="privateorpublic" src="assest/images/world.png" style="width:12px;opacity: 0.6;">';
              } else {
                html +=
                  '<img class="privateorpublic" src="assest/images/Private.png" style="width:12px;opacity: 0.6;">';
              }
              html += `</div>
                                </div>
                            </div>
                        </div></div>`;
              $(".listview_preview").append(html);
              $(".load_image2").hide();
            });
          } else {
            var html = `<div style="text-align:center">
                            <p>No post found</p>
                        </div>`;
            $(".listview_preview").append(html);
            $(".titleview_preview").append(html);
          }
          length_news();
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_allusers: function(role, d_name, type_user) {
      var input_data = {
        role: role,
        display_name: d_name,
        status: type_user
      };
      jQuery.ajax({
        url: base + "/get_allusers",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".user_management_details").empty();
          if (data.length == 0) {
            var html = `<div class="col-md-12 shadow">
                        <p style="text-align: center;padding-top: 12px;padding-bottom: 5px;">sorry no user found</p></div>`;
            $(".user_management_details").append(html);
            $(".loading_imag").hide();
          }
          jQuery.each(data, function(index, value) {
            var html = `<div class="col-md-12 shadow check${value.id}" style="padding: 0;margin: 19px 0 0 0;">
                          <div class="col-md-3" style="padding: 0;width: 197px;">
                            <div class="col-md-12" style="background-color: #EAEAEA;padding:0;padding-top: 9px;padding-bottom: 11px;">
                              <div class="col-md-2" style="width: 59px">`;
            if (value.profile_pic && value.profile_pic != "") {
              html += `<img src="${
                value.profile_pic
              }" style="width: 55px;height: 55px;border-radius: 63px;">`;
            } else {
              html += `<img src="assest/images/user.png" style="width: 55px;height: 55px;border-radius: 63px;">`;
            }
            html += `</div>
              <div class="col-md-10" style="width: 134px;padding-left:19px;top: 8px;word-break: break-word;">
                  <span style="font-weight: 700">${
                    value.display_name
                  }</span><br>`;
            if (value.role_id == 1) {
              html += `<span style="">Professional</span>`;
            } else {
              html += `<span style="">Business</span>`;
            }
            html += `</div>
          </div>
          </div>
          <div class="col-md-8" style="padding-top: 28px;">
            <span><img src="assest/images/feeds.png" style="width: 23px;margin-right: 6px;"><span>${
              value.user_posts.length
            } Feed</span></span>
            <span style="padding-left: 13px"><img src="assest/images/activities.png" style="width: 23px;margin-right: 6px;"><span>${
              value.user_favourites.length
            } Activities</span></span>
            <span style="padding-left: 13px"><img src="assest/images/jobs_applied.png" style="width: 23px;margin-right: 6px;"><span>${
              value.user_jobs.length
            } Job Applied</span></span>
            <span style="padding-left: 13px"><img src="assest/images/followers_following.png" style="width: 23px;margin-right: 6px;"><span>${value
              .follower_user.length + value.follower_user.length} Followers & Following</span></span>`;
             if (value.status == 2) {
               html += `<span style="padding-left: 13px"><span class="user_status" style="color: red" data-id="${value.id}">Deactivated</span></span>`;
             }else{
               html += `<span style="padding-left: 13px"><span class="user_status" style="color: green" data-id="${value.id}">Active</span></span>`;   
             }
            if (value.user_reports.length > 0) {
              html += `<span style="padding-left: 6px; float: right;" ><img src="assest/images/danger.png" style="width: 17px;">
              <span class="reported_post" data-id="${
                value.user_name
              }" style="font-size: 13px;color: red; cursor:pointer;">
                ${
                  value.user_reports.length
                } Reported</span></span>`;
            }
            html += `
                  </div>
            <div class="col-md-1" style="padding: 0;top: 18px;left: 25px;">`;
            if (value.status == 2) {
              html += `<button class="deactive check_user" style="outline: none;display: none;" data-hasuraid="${value.hasura_id}" data-id="${
                value.id
              }">Block&nbspUser</button>
                <button class="Unblock_active check_user" style="outline: none;" data-hasuraid="${value.hasura_id}" data-id="${
                  value.id}">Unblock&nbspUser</button>`;
            } else {
              html += `<button class="deactive check_user" style="outline: none;" data-hasuraid="${value.hasura_id}" data-id="${
                value.id
              }">Block&nbspUser</button>
              <button class="Unblock_active check_user" style="display: none;outline: none;" data-hasuraid="${value.hasura_id}" data-id="${
                value.id
              }">Unblock&nbspUser</button>`;
            }
            html += `</div>
              </div>`;
            $(".user_management_details").append(html);
        		$(".loading_imag").hide();
          });
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_reportusers: function(role, d_name, type_user) {
      var input_data = {
        role: role,
        display_name: d_name,
        status: type_user
      };
      jQuery.ajax({
        url: base + "/get_reportusers",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".user_reportusers").empty();
          if (data.length == 0) {
            var html = `<div class="col-md-12 shadow">
                        <p style="text-align: center;padding-top: 12px;padding-bottom: 5px;">sorry no user found</p></div>`;
            $(".user_reportusers").append(html);
            $(".loading_imag").hide();
          }
          jQuery.each(data, function(index, value) {
            if(value.user_profile !== null){
                var html = `<div class="col-md-12 shadow check${value.user_profile.id}" style="padding: 0;margin: 19px 0 0 0;">
                          <div class="col-md-3" style="padding: 0;width: 197px;">
                            <div class="col-md-12" style="background-color: #EAEAEA;padding:0;padding-top: 9px;padding-bottom: 11px;">
                              <div class="col-md-2" style="width: 59px">`;
            if (value.user_profile.profile_pic && value.user_profile.profile_pic != "") {
              html += `<img src="${
                value.user_profile.profile_pic
              }" style="width: 55px;height: 55px;border-radius: 63px;">`;
            } else {
              html += `<img src="assest/images/user.png" style="width: 55px;height: 55px;border-radius: 63px;">`;
            }
            html += `</div>
              <div class="col-md-10" style="width: 134px;padding-left:19px;top: 8px;word-break: break-word;">
                  <span style="font-weight: 700">${
                    value.user_profile.display_name
                  }</span><br>`;
            if (value.user_profile.role_id == 1) {
              html += `<span style="">Professional</span>`;
            } else {
              html += `<span style="">Business</span>`;
            }
            html += `</div>
          </div>
          </div>
          <div class="col-md-8" style="padding-top: 28px;">`;

             if (value.user_profile.status == 2) {
               html += `<span style="padding-left: 13px"><span class="user_status" style="color: red" data-id="${value.user_profile.id}">Deactivated</span></span>`;
             }else{
               html += `<span style="padding-left: 13px"><span class="user_status" style="color: green" data-id="${value.user_profile.id}">Active</span></span>`;   
             }
            if (value.user_profile.user_reports.length > 0) {
              html += `<span style="padding-left: 6px; float: right;" ><img src="assest/images/danger.png" style="width: 17px;">
              <span class="reported_post" data-id="${
                value.user_profile.user_name
              }" style="font-size: 13px;color: red; cursor:pointer;">
                ${
                  value.user_profile.user_reports.length
                } Reported</span></span>`;
            }
            html += `
                  </div>
            <div class="col-md-1" style="padding: 0;top: 18px;left: 25px;">`;
            if (value.user_profile.status == 2) {
              html += `<button class="deactive check_user" style="outline: none;display: none;" data-hasuraid="${value.user_profile.hasura_id}" data-id="${
                value.user_profile.id
              }">Block&nbspUser</button>
                <button class="Unblock_active check_user" style="outline: none;" data-hasuraid="${value.user_profile.hasura_id}" data-id="${
                  value.user_profile.id}">Unblock&nbspUser</button>`;
            } else {
              html += `<button class="deactive check_user" style="outline: none;" data-hasuraid="${value.user_profile.hasura_id}" data-id="${
                value.user_profile.id
              }">Block&nbspUser</button>
              <button class="Unblock_active check_user" style="display: none;outline: none;" data-hasuraid="${value.user_profile.hasura_id}" data-id="${
                value.user_profile.id
              }">Unblock&nbspUser</button>`;
            }
            html += `</div>
              </div>`;
            $(".user_reportusers").append(html);
            }
            $(".loading_imag").hide();
          });
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    block_post: function(id, status, src) {
      var input_data = {
        post_id: parseInt(id),
        poststatus: parseInt(status)
      };
      jQuery.ajax({
        url: "https://api.zibahub.net/block_post",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          if (src.hasClass("block")) {
            src.removeClass("block");
            src.addClass("unblock");
            src.text("Add");
          } else {
            src.removeClass("unblock");
            src.addClass("block");
            src.text("Remove");
          }
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_deactivate_user: function(id) {
       var reqbody = {
        hasura_id: parseInt(id) 
      };
      jQuery.ajax({
        url: "https://auth.zibahub.net/v1/admin/user/deactivate",
        dataType: "json",
        type: "POST",
        headers: {
          contentType: "application/json",
          Authorization: "Bearer " + localStorage.getItem("auth_token"),
          "X-Hasura-Role" : "admin",
        },
        data: JSON.stringify(reqbody),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
        },
        error: function(jqXhr, textStatus, errorThrown) {
          App.error_alert("something went wrong");
        }
      });
    },
    get_activate_user: function(id) {
       var reqbody = {
        hasura_id: parseInt(id)
      };
      jQuery.ajax({
        url: "https://auth.zibahub.net/v1/admin/user/activate",
        dataType: "json",
        type: "POST",
        headers: {
          contentType: "application/json",
          Authorization: "Bearer " + localStorage.getItem("auth_token"),
          "X-Hasura-Role" : "admin",
        },
        data: JSON.stringify(reqbody),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
        },
        error: function(jqXhr, textStatus, errorThrown) {
          App.error_alert("something went wrong");
        }
      });
    },
    deactivate_user: function(id, status, src, hasura) {
      var input_data = {
        user_id: parseInt(id),
        userstatus: status,
        hasura_id: parseInt(hasura),
      };
      jQuery.ajax({
        url: base + "/deactivate_user",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          if (src.hasClass("Unblock_active")) {
            src.hide();
            src
              .parent()
              .find(".deactive")
              .show();
            $("#deactivate_user").modal("hide");
            $(".check"+id).find(".user_status").text("Active").css("color" , "green");
            App.get_activate_user(hasura)
          } else {
            src
              .parent()
              .find(".Unblock_active")
              .show();
            src.hide();
            $("#deactivate_user").modal("hide");
            $(".check"+id).find(".user_status").text("Deactivated").css("color" , "red");
            App.get_deactivate_user(hasura)
          }
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    block_user: function(id, status, hasura) {
      var input_data = {
        user_id: parseInt(id),
        userstatus: status,
        hasura_id: parseInt(hasura),
      };
      jQuery.ajax({
        url: base + "/block_userprofile",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    readnotification: function(id, status) {
      var p_id = [];
      p_id.push(id);
      var input_data = {
        report_id_array: id,
        status: status
      };
      jQuery.ajax({
        url: base + "/read",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {},
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_admin_notification: function(offset) {
      var input_data = {
        pageoffset: offset
      };
      jQuery.ajax({
        url: base + "/admin_notification",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token")
        },
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".list_notification").empty();
          if (data.body.length > 0) {
            jQuery.each(data.body, function(index, value) {
              if (value.pushtype != 1) {
                var modal = `data-toggle="modal" data-target="#post_show"`;
                var class_check = `notification_click`;
                var cursor = `cursor:pointer`;
              } else {
                var modal = ``;
                var class_check = ``;
                var cursor = ``;
              }
              if (value.is_read == false) {
                var html = `<div class="col-md-12 shadow "  style="margin-top: 8px;padding-right:0; ${cursor}" >`;
              } else {
                var html = `<div class="col-md-12 shadow "  style="margin-top: 8px;padding-right:0;background-color:#efeeee; ${cursor}" >`;
              }
              html += `<div class="col-md-2 imging ${class_check}" ${modal} style="width: 70px;padding-left: 0; " data-id="
              ${
                jQuery.type(value.comment) == "object"
                  ? value.comment.commentcontent.post_id
                  : value.post_id
              }" data-nid="${value.id}">`;
              if (
                value.user_profile.profile_pic != " " &&
                value.user_profile.profile_pic != ""
              ) {
                html += `<img src="${
                  value.user_profile.profile_pic
                }" style="width: 60px;;border-radius: 60px;height: 60px;">`;
              } else {
                html += `<img class="" src="assest/images/notification_icon.png" style="width: 60px;opacity:0.8;border-radius: 60px;height: 60px;">`;
              }
              html += `</div>
                <div class="col-md-10 ${class_check}" ${modal} style="padding-left: 0px;padding-right: 0;" data-id="${
                jQuery.type(value.comment) == "object"
                  ? value.comment.commentcontent.post_id
                  : value.post_id
              }" data-nid="${value.id}">`;
              if (value.image_url) {
                html += `<img src="${
                  value.image_url
                }" style="width: 60px;float:right;height: 60px;">`;
              }
              if (value.pushtype == 1) {
                html += `<span class="align"><b style="opacity:0.9;">${
                  value.user_profile.display_name
                }</b></span><span class="align"> ${
                  value.description
                } </span><span class="align"><b style="opacity:0.9;">${
                  value.reporteduser.display_name
                }</b></span>`;
              } else {
                html += `<span class="align"><b style="opacity:0.9;">${
                  value.user_profile.display_name
                }</b></span><span class="align"> ${value.description} </span>
              `;}
              var msg_comment = "";
              try{
                  if (value.comment) {
                  var get_msg = jQuery.parseJSON(value.comment.commentcontent.comment);
                  msg_comment = get_msg.comment;
                }
              }catch{
                msg_comment=value.comment.commentcontent.comment
              }         
              if (msg_comment) {
                html += `<span style="margin-bottom: 0;text-overflow: ellipsis;display: inline-block;font-weight:700">"${msg_comment}"</span>`;
                // html+=`<input type="checkbox" name="read" style="float: right;"><div>`
              } else {
              }

              html += `<div><span class="align1" style="font-size: 11px;">${App.relative_time(
                value.created_at
              )}</span>
                                               
                                            </div>
                                        </div>`;
              //   if (value.is_read == false) {
              //     html += `<div class="col-md-1" style="padding:0px;">
              //                                 <input type="checkbox" class="notification_checkbox" name="read" style="float: right;margin-top: 24px;margin-left: 10px;" data-nid="${
              //                                   value.id
              //                                 }">
              //                                 </div>`;
              //   } else {
              //     html += `<div class="col-md-1" style="padding:0px;">
              //                                 <input type="checkbox" class="notification_checkbox" name="read" style="float: right;margin-top: 24px;margin-left: 10px;" data-nid="${
              //                                   value.id
              //                                 }" checked>
              //                                 </div>`;
              //   }
              html += `</div>`;
              $(".list_notification").append(html);
            });
          } else {
            if (data.length == 0) {
              var html = `<div class="col-md-12 col-sm-12 col-xs-12 shadow" style="text-align: center;padding-top: 23px;padding-bottom: 10px;">
                                <p>No notification available</p>
                            </div>`;
              $(".notification_empty").append(html);
            } else {
              $(".notification_empty").empty();
              $(".notification_empty").hide();
            }
          }
          $(".notification_load").hide();
        },
        error: function(jqXhr, textStatus, errorThrown) {
          $(".notification_load").hide();
        }
      });
    },
    get_Post: function(post_id_comments) {
      var profile_id = localStorage.getItem("user_id");
      var input_data = {
        post_id: parseInt(post_id_comments),
        user_profile_id: 826
      };
      jQuery.ajax({
        url: base + "/admin_comment",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        // headers: {
        //     "Authorization": "Bearer "
        // },
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          var commentcount = data[0].comments_count;
          var postid = data[0].id;
          App.comment_report_count(postid);
          var user_picture = localStorage.getItem("user_profile_pic");
          var content = "NA";
          if (
            data[0].post_content !== null &&
            data[0].post_content !== "null"
          ) {
            if (isURL(data[0].post_content)) {
              content = decodeURIComponent(data[0].post_content);
            } else {
              content = data[0].post_content;
            }
          }
          var html =
            '<div class="col-md-12" style="padding-top: 10px;padding-left: 0;padding-right: 0;padding-bottom: 10px;">' +
            '<div class="col-md-2" style="width: 52px;">';
          if (data[0].user_profile.profile_pic) {
            html +=
              '<img class="feed_profile_img" src="' +
              data[0].user_profile.profile_pic +
              '" style="width: 48px;border-radius: 41px;height: 48px;cursor:pointer" id="' +
              data[0].user_profile.id +
              '">';
          } else {
            html +=
              '<img class="feed_profile_img" src="assest/images/user.png" style="width: 48px;cursor:pointer" id="' +
              data[0].user_profile.id +
              '">';
          }
          html +=
            "</div>" +
            '<div class="col-md-10" style="padding-right: 0;padding-left: 15px;padding-top: 5px;">';
          if (data[0].is_active == true) {
            if (data[0].status == 2) {
              html += `<button class="unblock block_btn" style="outline:none" data-postid = "${
                data[0].id
              }">Add</button>`;
            } else {
              html += `<button class="block block_btn" style="outline:none" data-postid = "${
                data[0].id
              }">Remove</button>`;
            }
          } else {
            html += `<span style="outline:none;color:#485be4;float: right;margin-top: 6px;">Deleted</span>`;
          }
          html +=
            "<span><b>" +
            data[0].user_profile.display_name +
            "</b></span><br>" +
            '<span style="font-size: 11px;font">' +
            App.relative_time(data[0].created_at) +
            "</span>" +
            "</div>" +
            "</div>" +
            '<div class="col-md-12" style="padding-bottom: 10px;padding-left: 20px;">';
          // '<span style="font-size: 13px;">'+data+'</span>'+
          var text_content = content.split(" ");
          var length_text = text_content.length;
          for (var i = 0; i < length_text; i++) {
            if (text_content[i].indexOf("\n") > -1) {
              var text_data = text_content[i].replace(/\n/gi, " ");
              var text_url1 = text_data.split(" ");
              for (var j = 0; j < text_url1.length; j++) {
                text_url = text_url1[j];
                if (ValidURL(text_url)) {
                  if (data[0].url_content) {
                    if (data[0].url_content.hasOwnProperty("canonicalurl")) {
                      if (data[0].url_content.canonicalurl) {
                        html +=
                          '<a href="' +
                          data[0].url_content.url +
                          '" target="_blank"><span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;" >' +
                          text_url +
                          " </span></a>";
                      }
                    } else {
                      // App.url_post(text_url);
                      // var url_post = localStorage.getItem("url_post_preview");
                      if (text_url.indexOf("http") == 0) {
                        url_post = text_url;
                      } else {
                        url_post = "http://" + text_url;
                      }
                      html +=
                        '<a href="' +
                        url_post +
                        '" target="_blank"><span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;">' +
                        text_url +
                        " </span></a>";
                    }
                  } else {
                    // App.url_post(text_url);
                    // var url_post = localStorage.getItem("url_post_preview");
                    if (text_url.indexOf("http") == 0) {
                      url_post = text_url;
                    } else {
                      url_post = "http://" + text_url;
                    }
                    html +=
                      '<a href="' +
                      url_post +
                      '" target="_blank"><span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;">' +
                      text_url +
                      " </span></a>";
                  }
                } else {
                  html +=
                    '<span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;">' +
                    text_url +
                    " </span>";
                }
              }
            } else {
              text_url = text_content[i].replace(/\n/gi, " ");
              if (ValidURL(text_url)) {
                if (data[0].url_content) {
                  if (data[0].url_content.hasOwnProperty("canonicalurl")) {
                    if (data[0].url_content.canonicalurl) {
                      html +=
                        '<a href="' +
                        data[0].url_content.url +
                        '" target="_blank"><span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;" >' +
                        text_url +
                        " </span></a>";
                    }
                  } else {
                    // App.url_post(text_url);
                    // var url_post = localStorage.getItem("url_post_preview");
                    if (text_url.indexOf("http") == 0) {
                      url_post = text_url;
                    } else {
                      url_post = "http://" + text_url;
                    }
                    html +=
                      '<a href="' +
                      url_post +
                      '" target="_blank"><span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;">' +
                      text_url +
                      " </span></a>";
                  }
                } else {
                  // App.url_post(text_url);
                  // var url_post = localStorage.getItem("url_post_preview");
                  if (text_url.indexOf("http") == 0) {
                    url_post = text_url;
                  } else {
                    url_post = "http://" + text_url;
                  }
                  html +=
                    '<a href="' +
                    url_post +
                    '" target="_blank"><span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;">' +
                    text_url +
                    " </span></a>";
                }
              } else {
                html +=
                  '<span style="font-size: 13px;padding-top: 10px;margin-bottom: 0px;">' +
                  text_url +
                  " </span>";
              }
            }
          }
          html += "</div>";
          if (data[0].redirection_url) {
            html +=
              '<div class="col-md-12" style="padding-left: 0px;padding-right:0px">' +
              '<img BORDER="0" src="data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==" class="portfolio_img1" data-toggle="modal" data-target="#myModal51" style="border:0px;width: 100%;height:250px;background-position:center;background-repeat: no-repeat;background-size: contain;background-image: url(' +
              data[0].redirection_url +
              ');background-color: #b9b9b9;">' +
              "</div>";
          } else {
            if (data[0].url_content) {
              if (data[0].url_content.hasOwnProperty("canonicalurl")) {
                if (data[0].url_content.canonicalurl) {
                  html +=
                    '<a href="' +
                    data[0].url_content.url +
                    '" target="_blank"><div class="col-md-12" id="url_div" style="border: 1px solid #dcdbdb;background-color: #EEEEEE;padding-right: 0;padding-left: 0;">' +
                    '<div class="col-md-2" style="padding-left: 0;">' +
                    '<img  src="' +
                    data[0].url_content.imageurl +
                    '"  style="width: 97px;height: 97px;object-fit: contain;">' +
                    "</div>" +
                    '<div class="col-md-10" style="padding-right: 0;padding-top: 10px;padding-left: 22px;">' +
                    "<div>" +
                    '<b><p style="font-weight: 600px;color:black;">' +
                    data[0].url_content.title +
                    "</p></b>" +
                    '<p  style="opacity: 0.8;color:black;padding-right: 15px;">' +
                    data[0].url_content.description +
                    "</p>" +
                    "</div>" +
                    "</div>" +
                    "</div></a>";
                }
              }
            }
          }
          html +=
            '<div class="col-md-12" style="padding-left: 9px;padding-top: 9px;padding-bottom: 9px;background-color:#ececec;">' +
            '<div class="col-md-6" style="padding-left: 10px;">';
          if (data[0].like_count > 0) {
            if (data[0].like_count == 1) {
              html +=
                ' <span data-toggle="modal" data-target="#list_of_user" style="cursor:pointer" class="like_count"  data-likepostid=' +
                data[0].id +
                ">" +
                data[0].like_count +
                " Like</span>";
            } else {
              html +=
                ' <span data-toggle="modal" data-target="#list_of_user" style="cursor:pointer" class="like_count"  data-likepostid=' +
                data[0].id +
                ">" +
                data[0].like_count +
                " Likes</span>";
            }
          } else {
            html +=
              ' <span data-toggle="modal" data-target="#list_of_user" style="cursor:pointer" class="like_count"  data-likepostid=' +
              data[0].id +
              ">0 Like</span>";
          }
          if (data[0].comments_count > 0) {
            if (data[0].comments_count == 1) {
              html +=
                '<span class="modal_comment_count" style="padding-left: 7px;">' +
                data[0].comments_count +
                " Comment</span>";
            } else {
              html +=
                '<span class="modal_comment_count" style="padding-left: 7px;">' +
                data[0].comments_count +
                " Comments</span>";
            }
          } else {
            html +=
              '<span class="modal_comment_count" style="padding-left: 7px;">0 Comment</span>';
          }
          html += "</div>";
          html += `<div class="col-md-6" style="padding:0;text-align:right">
                            <span class="show_reported_comments" style="cursor:pointer;" data-postid="${postid}">Show <span class="count_report"></span> Reported Comments</span>
                            <span class="show_all_comments" style="display:none;cursor:pointer" data-postid="${postid}">Show All Comments</span>
                        </div>`;

          // '<span class="like_count">'+data[0].like_count+' Likes</span><span style="padding-left: 10px;">'+data[0].comments_count+' Comments</span>'+
          html +=
            "</div>" +
            // '<hr class="hr1">' +
            '<div class="col-md-12" id="target_comment" style="padding-top: 12px;padding-left: 0;padding-right: 0;background-color: #F5F5F5;">' +
            '<div class="col-md-12 show_comments_load" style="text-align: center;display:none;top: 17px;">' +
            '<img src="assest/images/loading.gif" style="width:20px;">' +
            "</div>";
          // '<span style="font-size: 15px;font-weight: 700;padding-left: 19px;">Comments</span>'+
          html += `<div class="col-md-12 show_comments" style="padding:0">`;
          var post_comment_count = data[0].post_comments.length;
          if (post_comment_count == 0) {
            html +=
              '<div class="col-md-12 div_empty_feed" style="padding-top: 10px;padding-left: 0;padding-right: 0;">' +
              '<p style="padding-left: 15px;">There are no comments</p>' +
              "</div>";
          } else {
            jQuery.each(data[0].post_comments, function(index, value) {
              var compare = post_comment_count - 1;

              if (post_comment_count > 0) {
                if (index != compare) {
                  html +=
                    '<div class="col-md-12 comments' +
                    value.id +
                    '" style="padding-top: 10px;padding-left: 0px;padding-right: 0;padding-bottom: 12px;">' +
                    '<div class="col-md-2 othere_user_profile" style="padding-right: 0;width: 55px;cursor:pointer" data-postuserid = "' +
                    value.user_profile.id +
                    '">';
                  if (value.user_profile.profile_pic) {
                    html +=
                      '<img class="profile_comments" src="' +
                      value.user_profile.profile_pic +
                      '" style="width: 48px;border-radius: 41px;height: 48px;" id="' +
                      value.user_profile.id +
                      '">';
                  } else {
                    html +=
                      '<img class="profile_comments" src="assest/images/user.png" style="width: 48px;" id="' +
                      value.user_profile.id +
                      '">';
                  }
                  // '<img src="'+value.user_profile.profile_pic+'" style="width: 48px;">'+
                  html +=
                    " </div>" +
                    '<div class="col-md-10 comment' +
                    value.id +
                    ' comment_show" style="top: 5px;padding-left: 25px;">' +
                    '<span class="profile_comments" style="color: black" id="' +
                    value.user_profile.id +
                    '"><b>' +
                    value.user_profile.display_name +
                    "</b></span><span> </span>";
                  var get_msg = jQuery.parseJSON(value.comment);
                  var msg_comment = get_msg.comment;
                  if (get_msg.mention.length > 0) {
                    for (var i = 0; i < get_msg.mention.length; i++) {
                      var check_type = new RegExp(
                        "@" + get_msg.mention[i].display_name,
                        "g"
                      );
                      msg_comment = msg_comment.replace(
                        check_type,
                        '<span class="feed_profile_img" id="' +
                          get_msg.mention[i].id +
                          '" style="font-size: 13px;color: #2ec3f5;border-radius: 7px;padding: 2px;cursor:pointer;"> ' +
                          get_msg.mention[i].display_name +
                          "</span>"
                      );
                    }
                    list_append = [];
                    html +=
                      '<span class="text_comment1">' + msg_comment + "</span>";
                  } else {
                    html +=
                      '<span class="text_comment1" style="font-size: 13px;">' +
                      msg_comment +
                      "</span>";
                  }
                  if (value.is_active == true) {
                    if (value.flag == false) {
                      html +=
                        '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                        value.id +
                        '">Hide Comment</span></br>';
                    } else {
                      html +=
                        '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                        value.id +
                        '">Show Comment</span></br>';
                    }
                  } else {
                    html +=
                      '<span class="" style="float: right;color:blue" data-cmdid = "' +
                      value.id +
                      '">Deleted</span></br>';
                  }
                  html +=
                    ' <span class="post_time" style="font-size: 11px;">' +
                    App.relative_time(value.created_at) +
                    "</span>";
                  if (value.comment_report.length > 0) {
                    html += `<span style="padding-left:6px;color:red;font-size:12px;">${
                      value.comment_report.length
                    } Reported</span>`;
                  }
                  html += "</div>" + "</div>" + '<hr class="hr1">';
                } else {
                  html +=
                    '<div class="col-md-12 comments' +
                    value.id +
                    '" style="padding-top: 10px;padding-left: 0;padding-right: 0;padding-bottom: 12px;">' +
                    '<div class="col-md-2 othere_user_profile" style="padding-right: 0;width: 55px;cursor:pointer" data-postuserid = "' +
                    value.user_profile.id +
                    '">';
                  if (value.user_profile.profile_pic) {
                    html +=
                      '<img src="' +
                      value.user_profile.profile_pic +
                      '" style="width: 48px;border-radius: 41px;height: 48px;">';
                  } else {
                    html +=
                      '<img src="assest/images/user.png" style="width: 48px;">';
                  }
                  html +=
                    " </div>" +
                    '<div class="col-md-10 comment' +
                    value.id +
                    ' comment_show" style="top: 5px;padding-left: 18px;">' +
                    '<span style="color: black"><b>' +
                    value.user_profile.display_name +
                    "</b></span></a><span> </span>";
                  var get_msg = jQuery.parseJSON(value.comment);
                  var msg_comment = get_msg.comment;
                  if (get_msg.mention.length > 0) {
                    for (var i = 0; i < get_msg.mention.length; i++) {
                      var check_type = new RegExp(
                        "@" + get_msg.mention[i].display_name,
                        "g"
                      );
                      msg_comment = msg_comment.replace(
                        check_type,
                        '<span class="feed_profile_img" id="' +
                          get_msg.mention[i].id +
                          '" style="font-size: 13px;color: #2ec3f5;border-radius: 7px;padding: 2px;cursor:pointer;"> ' +
                          get_msg.mention[i].display_name +
                          "</span>"
                      );
                    }
                    list_append = [];
                    html +=
                      '<span class="text_comment1">' + msg_comment + "</span>";
                  } else {
                    html +=
                      '<span class="text_comment1" style="font-size: 13px;">' +
                      msg_comment +
                      "</span>";
                  }
                  if (value.is_active == true) {
                    if (value.flag == false) {
                      html +=
                        '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                        value.id +
                        '">Hide Comment</span></br>';
                    } else {
                      html +=
                        '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                        value.id +
                        '">Show Comment</span></br>';
                    }
                  } else {
                    html +=
                      '<span class="" style="float: right;color:blue" data-cmdid = "' +
                      value.id +
                      '">Deleted</span></br>';
                  }
                  html +=
                    ' <span class="post_time" style="font-size: 11px;">' +
                    App.relative_time(value.created_at) +
                    "</span>";
                  if (value.comment_report.length > 0) {
                    html += `<span style="padding-left:6px;color:red;font-size:12px;">${
                      value.comment_report.length
                    } Reported</span>`;
                  }
                  html += "</div>" + "</div>" + "</div>";
                }
              } else {
                html +=
                  '<div class="col-md-12 div_empty_feed" style="padding-top: 10px;padding-left: 0;padding-right: 0;">' +
                  '<p style="padding-left: 19px;">No Data Found</p>' +
                  "</div>";
              }
            });
          }
          html +=
            '<ul id="comment_append" style="list-style-type: none;padding: 0;"></ul>' +
            "</div></div>" +
            "</div>" +
            '<div class="clearfix" style="padding-bottom: 10px;"></div>';
          $(".modal_parent_div").append(html);
          $(".gif_image1").hide();
          $(".border_radius").css("border-top-left-radius", "9px");
          $(".border_radius").css("border-top-right-radius", "9px");
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_show_comments: function(post_id_comments) {
      var profile_id = localStorage.getItem("user_id");
      var input_data = {
        post_id: parseInt(post_id_comments),
        user_profile_id: 826
      };
      jQuery.ajax({
        url: base + "/admin_comment",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        // headers: {
        //     "Authorization": "Bearer "
        // },
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          var commentcount = data[0].comments_count;
          var postid = data[0].id;
          var post_comment_count = data[0].post_comments.length;
          var html = `<div style="padding:0px">`;
          jQuery.each(data[0].post_comments, function(index, value) {
            var compare = post_comment_count - 1;
            if (post_comment_count > 0) {
              if (index != compare) {
                html +=
                  '<div class="col-md-12 comments' +
                  value.id +
                  '" style="padding-top: 10px;padding-left: 0px;padding-right: 0;padding-bottom: 12px;">' +
                  '<div class="col-md-2 othere_user_profile" style="padding-right: 0;width: 55px;cursor:pointer" data-postuserid = "' +
                  value.user_profile.id +
                  '">';
                if (value.user_profile.profile_pic) {
                  html +=
                    '<img class="profile_comments" src="' +
                    value.user_profile.profile_pic +
                    '" style="width: 48px;border-radius: 41px;height: 48px;" id="' +
                    value.user_profile.id +
                    '">';
                } else {
                  html +=
                    '<img class="profile_comments" src="assest/images/user.png" style="width: 48px;" id="' +
                    value.user_profile.id +
                    '">';
                }
                // '<img src="'+value.user_profile.profile_pic+'" style="width: 48px;">'+
                html +=
                  " </div>" +
                  '<div class="col-md-10 comment' +
                  value.id +
                  ' comment_show" style="top: 5px;padding-left: 25px;">' +
                  '<span class="profile_comments" style="color: black" id="' +
                  value.user_profile.id +
                  '"><b>' +
                  value.user_profile.display_name +
                  "</b></span><span> </span>";
                var get_msg = jQuery.parseJSON(value.comment);
                var msg_comment = get_msg.comment;
                if (get_msg.mention.length > 0) {
                  for (var i = 0; i < get_msg.mention.length; i++) {
                    var check_type = new RegExp(
                      "@" + get_msg.mention[i].display_name,
                      "g"
                    );
                    msg_comment = msg_comment.replace(
                      check_type,
                      '<span class="feed_profile_img" id="' +
                        get_msg.mention[i].id +
                        '" style="font-size: 13px;color: #2ec3f5;border-radius: 7px;padding: 2px;cursor:pointer;"> ' +
                        get_msg.mention[i].display_name +
                        "</span>"
                    );
                  }
                  list_append = [];
                  html +=
                    '<span class="text_comment1">' + msg_comment + "</span>";
                } else {
                  html +=
                    '<span class="text_comment1" style="font-size: 13px;">' +
                    msg_comment +
                    "</span>";
                }
                if (value.is_active == true) {
                  if (value.flag == false) {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Hide Comment</span></br>';
                  } else {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Show Comment</span></br>';
                  }
                } else {
                  html +=
                    '<span class="" style="float: right;color:blue" data-cmdid = "' +
                    value.id +
                    '">Deleted</span></br>';
                }
                html +=
                  ' <span class="post_time" style="font-size: 11px;">' +
                  App.relative_time(value.created_at) +
                  "</span>";
                if (value.comment_report.length > 0) {
                  html += `<span style="padding-left:6px;color:red;font-size:12px;">${
                    value.comment_report.length
                  } Reported</span>`;
                }
                html += "</div>" + "</div>" + '<hr class="hr1">';
              } else {
                html +=
                  '<div class="col-md-12 comments' +
                  value.id +
                  '" style="padding-top: 10px;padding-left: 0;padding-right: 0;padding-bottom: 12px;">' +
                  '<div class="col-md-2 othere_user_profile" style="padding-right: 0;width: 55px;cursor:pointer" data-postuserid = "' +
                  value.user_profile.id +
                  '">';
                if (value.user_profile.profile_pic) {
                  html +=
                    '<img src="' +
                    value.user_profile.profile_pic +
                    '" style="width: 48px;border-radius: 41px;height: 48px;">';
                } else {
                  html +=
                    '<img src="assest/images/user.png" style="width: 48px;">';
                }
                html +=
                  " </div>" +
                  '<div class="col-md-10 comment' +
                  value.id +
                  ' comment_show" style="top: 5px;padding-left: 18px;">' +
                  '<span style="color: black"><b>' +
                  value.user_profile.display_name +
                  "</b></span></a><span> </span>";
                var get_msg = jQuery.parseJSON(value.comment);
                var msg_comment = get_msg.comment;
                if (get_msg.mention.length > 0) {
                  for (var i = 0; i < get_msg.mention.length; i++) {
                    var check_type = new RegExp(
                      "@" + get_msg.mention[i].display_name,
                      "g"
                    );
                    msg_comment = msg_comment.replace(
                      check_type,
                      '<span class="feed_profile_img" id="' +
                        get_msg.mention[i].id +
                        '" style="font-size: 13px;color: #2ec3f5;border-radius: 7px;padding: 2px;cursor:pointer;"> ' +
                        get_msg.mention[i].display_name +
                        "</span>"
                    );
                  }
                  list_append = [];
                  html +=
                    '<span class="text_comment1">' + msg_comment + "</span>";
                } else {
                  html +=
                    '<span class="text_comment1" style="font-size: 13px;">' +
                    msg_comment +
                    "</span>";
                }
                if (value.is_active == true) {
                  if (value.flag == false) {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Hide Comment</span></br>';
                  } else {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Show Comment</span></br>';
                  }
                } else {
                  html +=
                    '<span class="" style="float: right;color:blue" data-cmdid = "' +
                    value.id +
                    '">Deleted</span></br>';
                }
                html +=
                  ' <span class="post_time" style="font-size: 11px;">' +
                  App.relative_time(value.created_at) +
                  "</span>";
                if (value.comment_report.length > 0) {
                  html += `<span style="padding-left:6px;color:red;font-size:12px;">${
                    value.comment_report.length
                  } Reported</span>`;
                }
                html += "</div>" + "</div>" + "</div>";
              }
            } else {
              html +=
                '<div class="col-md-12 div_empty_feed" style="padding-top: 10px;padding-left: 0;padding-right: 0;">' +
                '<p style="padding-left: 19px;">No Data Found</p>' +
                "</div>";
            }
          });
          html += `</div>`;
          $(".show_comments_load").hide();
          $(".show_comments").append(html);
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    reported_comments: function(post_id_comments) {
      var profile_id = localStorage.getItem("user_id");
      var input_data = {
        post_id: parseInt(post_id_comments)
      };
      jQuery.ajax({
        url: base + "/reported_comments",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        // headers: {
        //     "Authorization": "Bearer "
        // },
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          var postid = post_id_comments;
          var post_comment_count = data.length;
          var html = `<div style="padding:0px">`;
          jQuery.each(data, function(index, value) {
            var compare = post_comment_count - 1;
            if (post_comment_count > 0) {
              if (index != compare) {
                html +=
                  '<div class="col-md-12 comments' +
                  value.id +
                  '" style="padding-top: 10px;padding-left: 0px;padding-right: 0;padding-bottom: 12px;">' +
                  '<div class="col-md-2 othere_user_profile" style="padding-right: 0;width: 55px;cursor:pointer" data-postuserid = "' +
                  value.user_profile.id +
                  '">';
                if (value.user_profile.profile_pic) {
                  html +=
                    '<img class="profile_comments" src="' +
                    value.user_profile.profile_pic +
                    '" style="width: 48px;border-radius: 41px;height: 48px;" id="' +
                    value.user_profile.id +
                    '">';
                } else {
                  html +=
                    '<img class="profile_comments" src="assest/images/user.png" style="width: 48px;" id="' +
                    value.user_profile.id +
                    '">';
                }
                // '<img src="'+value.user_profile.profile_pic+'" style="width: 48px;">'+
                html +=
                  " </div>" +
                  '<div class="col-md-10 comment' +
                  value.id +
                  ' comment_show" style="top: 5px;padding-left: 25px;">' +
                  '<span class="profile_comments" style="color: black" id="' +
                  value.user_profile.id +
                  '"><b>' +
                  value.user_profile.display_name +
                  "</b></span><span> </span>";
                var get_msg = jQuery.parseJSON(value.comment);
                var msg_comment = get_msg.comment;
                if (get_msg.mention.length > 0) {
                  for (var i = 0; i < get_msg.mention.length; i++) {
                    var check_type = new RegExp(
                      "@" + get_msg.mention[i].display_name,
                      "g"
                    );
                    msg_comment = msg_comment.replace(
                      check_type,
                      '<span class="feed_profile_img" id="' +
                        get_msg.mention[i].id +
                        '" style="font-size: 13px;color: #2ec3f5;border-radius: 7px;padding: 2px;cursor:pointer;"> ' +
                        get_msg.mention[i].display_name +
                        "</span>"
                    );
                  }
                  list_append = [];
                  html +=
                    '<span class="text_comment1">' + msg_comment + "</span>";
                } else {
                  html +=
                    '<span class="text_comment1" style="font-size: 13px;">' +
                    msg_comment +
                    "</span>";
                }
                if (value.is_active == true) {
                  if (value.flag == false) {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Hide Comment</span></br>';
                  } else {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Show Comment</span></br>';
                  }
                } else {
                  html +=
                    '<span class="" style="float: right;color:blue" data-cmdid = "' +
                    value.id +
                    '">Deleted</span></br>';
                }
                html +=
                  ' <span class="post_time" style="font-size: 11px;">' +
                  App.relative_time(value.created_at) +
                  "</span>";
                if (value.comment_report.length > 0) {
                  html += `<span style="padding-left:6px;color:red;font-size:12px;">${
                    value.comment_report.length
                  } Reported</span>`;
                }
                html += "</div>" + "</div>" + '<hr class="hr1">';
              } else {
                html +=
                  '<div class="col-md-12 comments' +
                  value.id +
                  '" style="padding-top: 10px;padding-left: 0;padding-right: 0;padding-bottom: 12px;">' +
                  '<div class="col-md-2 othere_user_profile" style="padding-right: 0;width: 55px;cursor:pointer" data-postuserid = "' +
                  value.user_profile.id +
                  '">';
                if (value.user_profile.profile_pic) {
                  html +=
                    '<img src="' +
                    value.user_profile.profile_pic +
                    '" style="width: 48px;border-radius: 41px;height: 48px;">';
                } else {
                  html +=
                    '<img src="assest/images/user.png" style="width: 48px;">';
                }
                html +=
                  " </div>" +
                  '<div class="col-md-10 comment' +
                  value.id +
                  ' comment_show" style="top: 5px;padding-left: 18px;">' +
                  '<span style="color: black"><b>' +
                  value.user_profile.display_name +
                  "</b></span></a><span> </span>";
                var get_msg = jQuery.parseJSON(value.comment);
                var msg_comment = get_msg.comment;
                if (get_msg.mention.length > 0) {
                  for (var i = 0; i < get_msg.mention.length; i++) {
                    var check_type = new RegExp(
                      "@" + get_msg.mention[i].display_name,
                      "g"
                    );
                    msg_comment = msg_comment.replace(
                      check_type,
                      '<span class="feed_profile_img" id="' +
                        get_msg.mention[i].id +
                        '" style="font-size: 13px;color: #2ec3f5;border-radius: 7px;padding: 2px;cursor:pointer;"> ' +
                        get_msg.mention[i].display_name +
                        "</span>"
                    );
                  }
                  list_append = [];
                  html +=
                    '<span class="text_comment1">' + msg_comment + "</span>";
                } else {
                  html +=
                    '<span class="text_comment1" style="font-size: 13px;">' +
                    msg_comment +
                    "</span>";
                }
                if (value.is_active == true) {
                  if (value.flag == false) {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Hide Comment</span></br>';
                  } else {
                    html +=
                      '<span class="remove_comments" style="float: right;" data-cmdid = "' +
                      value.id +
                      '">Show Comment</span></br>';
                  }
                } else {
                  html +=
                    '<span class="" style="float: right;color:blue" data-cmdid = "' +
                    value.id +
                    '">Deleted</span></br>';
                }
                html +=
                  ' <span class="post_time" style="font-size: 11px;">' +
                  App.relative_time(value.created_at) +
                  "</span>";
                if (value.comment_report.length > 0) {
                  html += `<span style="padding-left:6px;color:red;font-size:12px;">${
                    value.comment_report.length
                  } Reported</span>`;
                }
                html += "</div>" + "</div>" + "</div>";
              }
            } else {
              html +=
                '<div class="col-md-12 div_empty_feed" style="padding-top: 10px;padding-left: 0;padding-right: 0;">' +
                '<p style="padding-left: 19px;">No Data Found</p>' +
                "</div>";
            }
          });
          html += `</div>`;
          $(".show_comments_load").hide();
          $(".show_comments").append(html);
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_likeduser: function(post_id_like) {
      var input_data = {
        post_id: parseInt(post_id_like)
      };

      jQuery.ajax({
        url: base + "/get_likeduser",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token")
        },
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".gif_image2").hide();
          var length_data = data.length;
          $("#count_like").text(length_data + " Likes");
          if (length_data == 0) {
            var html =
              '<div class="col-md-12" style="padding-top: 10px;padding-bottom: 10px;background-color: white">' +
              '<p style="padding-left: 15px;">No one like you post</p>' +
              "</div>";
            $("#scroll_like").append(html);
          }
          jQuery.each(data, function(index, value) {
            if (length_data - 1 != index) {
              var html =
                '<div class="col-md-12 feed_profile_img" id="' +
                value.user_profile.id +
                '" style="padding-top: 10px;padding-bottom: 10px;background-color: white;padding-left: 10px;cursor:pointer">' +
                '<div class="col-md-2" style="padding-right: 0;width: 48px;padding-left:0 ;">';
              if (value.user_profile.profile_pic) {
                html +=
                  '<img class="like_profile"  src="' +
                  value.user_profile.profile_pic +
                  '" style="width:52px;border-radius: 55px;height:52px;">';
              } else {
                html +=
                  '<img class="like_profile"  src="assest/images/user.png" style="width:52px;border-radius: 55px;">';
              }
              html +=
                "</div>" +
                '<div class="col-md-10" style="padding-top:16px;">' +
                "<span>" +
                value.user_profile.display_name +
                "</span>" +
                // '<span style="float: right;cursor:pointer"><img src="assest/images/follow_512px.png"  style="width: 29px;"><span style="font-weight:bolder;"> Follow</span></span>'+
                "</div>" +
                "</div>" +
                '<hr class="hr1" style="width: 94%;">';
            } else {
              html =
                '<div class="col-md-12 feed_profile_img" id="' +
                value.user_profile.id +
                '" style="padding-top: 10px;padding-bottom: 10px;background-color: white;padding-left: 10px;cursor:pointer">' +
                '<div class="col-md-2" style="padding-right: 0;width: 48px;padding-left:0;cursor:pointer">';
              if (value.user_profile.profile_pic) {
                html +=
                  '<img class="like_profile"  src="' +
                  value.user_profile.profile_pic +
                  '" style="width:52px;border-radius: 55px;height:52px;">';
              } else {
                html +=
                  '<img class="like_profile"  src="assest/images/user.png" style="width:52px;border-radius: 55px;">';
              }
              html +=
                "</div>" +
                '<div class="col-md-10" style="padding-top:16px;">' +
                "<span>" +
                value.user_profile.display_name +
                "</span>" +
                // '<span style="float: right;cursor:pointer"><img src="assest/images/follow_512px.png"  style="width: 29px;"><span style="font-weight:bolder;"> Follow</span></span>'+
                "</div>" +
                "</div>";
            }

            $("#scroll_like").append(html);
            $(".like_border_radius").css("border-top-left-radius", "4px");
            $(".like_border_radius").css("border-top-right-radius", "4px");
          });
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    remove_comments: function(id, status) {
      var input_data = {
        comment_id: parseInt(id),
        status: status
      };
      jQuery.ajax({
        url: base + "/rm_comment ",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {},
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    add_faq: function(type, qusetion, answer, faq_id) {
      var input_data = {
        faq_type: type,
        question: qusetion,
        answer: answer,
        faq_id: faq_id
      };
      jQuery.ajax({
        url: base + "/faq ",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          if (type == 1) {
            var html = `<div class="col-md-12 col-sm-12 col-xs-12 faq${
              data.returning[0].id
            } shadow" style="margin-top:10px">
                      <div class="col-md-12 col-sm-12 col-xs-12" data-id="${
                        data.returning[0].id
                      }" style="padding-left: 0;">
                          <label class="title${
                            data.returning[0].id
                          }" style="font-size: 14px;">${qusetion}</label>
                          <img class="delete_faq" src="assest/images/delete.jpg" data-toggle="modal" data-target="#remove_faq" style="width: 14px;float:right;cursor:pointer">
                          <img class="edit_faqs" src="assest/images/edit.png" data-toggle="modal" data-target="#edit_faq" style="width: 14px;float:right;margin-right: 8px;cursor:pointer;">
                          <p class="content${
                            data.returning[0].id
                          }">${answer}</p>
                          <p style="font-size: 12px;position: absolute;right: 0;top: 41px;">Just now</p>
                      </div>
                  </div>`;
            $(".new_faq").append(html);
          } else if (type == 2) {
            $(".title" + faq_id).text(qusetion);
            $(".content" + faq_id).text(answer);
            $(".create_date" + faq_id).text("Just now");
          } else if (type == 3) {
            $(".fad" + faq_id).remove();
          }
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_faq: function(type, qusetion, answer, faq_id) {
      var input_data = {
        faq_type: 0,
        question: "",
        answer: "",
        faq_id: 0
      };
      jQuery.ajax({
        url: base + "/faq ",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".new_faq").empty();
          jQuery.each(data, function(index, value) {
            var html = `<div class="col-md-12 col-sm-12 col-xs-12 fad${
              value.id
            } shadow" style="margin-top:10px">
                          <div class="col-md-12 col-sm-12 col-xs-12" data-id="${
                            value.id
                          }" style="padding-left: 0;">
                              <label class="title${
                                value.id
                              }" style="font-size: 14px;">${
              value.question
            }</label>
                              <img class="delete_faq" src="assest/images/delete.jpg" data-toggle="modal" data-target="#remove_faq" style="width: 14px;float:right;cursor:pointer;margin-top: 6px;">
                              <img class="edit_faqs" src="assest/images/edit.png" data-toggle="modal" data-target="#edit_faq" style="width: 14px;float:right;margin-right: 8px;cursor:pointer;margin-top: 6px;">
                              <p class="content${value.id}">${value.answer}</p>
                              <p class="create_date${value.id}" style="font-size: 12px;position: absolute;right: 0;top: 41px;">${App.relative_time(
                                value.modified_at
                              )}</p>
                          </div>
                      </div>`;
            $(".new_faq").append(html);
            $(".loading_imag").hide();  
          });
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_supports: function(type, qusetion, answer, faq_id) {
      jQuery.ajax({
        url: base + "/get_support",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $("#supports").empty();
          if (data.length == 0) {
            var html = `<div class="col-md-12 col-sm-12 col-xs-12 shadow" style="margin-top:10px">
                             <p style="text-align:center;padding-top: 12px;padding-bottom: 5px;">No support request</p>
                          </div>`;
            $("#supports").append(html);
            $(".loading_imag").hide();
          }
          jQuery.each(data, function(index, value) {
            if (value.image_url) {
              var html = `<div class="col-md-12 col-sm-12 col-xs-12 shadow" style="width: 98.5%;margin-top:10px;padding: 13px 13px 8px 13px">
                                <div class="col-md-10 col-sm-10 col-xs-10" style="padding-left:0">
                                    <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Problem</p>
                                    <label style="margin-left: 5px;font-size:16px">${
                                      value.problem
                                    }</label>
                                    <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Subject</p>
                                    <p style="margin-left: 5px;font-size:15px">${
                                      value.subject
                                    }</p>
                                    <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Problem Description</p>
                                    <p style="margin-left: 5px;font-size:14px">${
                                      value.desc
                                    }</p>
                                    <img src="assest/images/placeholderUser.png" style="width:23px"><span style="font-size:14px">${
                                      value.user_profile.display_name
                                    }</span>
                                    <img src="assest/images/envelope.png" style="width:15px;opacity: 0.8;margin-left: 5px;"><span style="padding-left:5px;font-size:14px">${
                                      value.user_profile.email
                                    }</span>
                                    <p style="padding-left: 3px;padding-top: 8px;">${App.relative_time(
                                      value.created_at
                                    )}</p>
                                </div>
                                <div class="col-md-2 col-sm-2 col-xs-2" style="padding:0;float:right">
                                    <img src="${
                                      value.image_url
                                    }" style="width:100%;height:190px;">
                                </div>
                            </div>`;
            } else {
              var html = `<div class="col-md-12 col-sm-12 col-xs-12 shadow" style="width: 98.5%;margin-top:10px;padding: 13px 13px 8px 13px">
                                    <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Problem</p>
                                    <label style="margin-left: 5px;font-size:16px">${
                                      value.problem
                                    }</label>
                                    <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Subject</p>
                                    <p style="margin-left: 5px;font-size:15px">${
                                      value.subject
                                    }</p>
                                    <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Problem Description</p>
                                    <p style="margin-left: 5px;font-size:14px">${
                                      value.desc
                                    }</p>
                                    <img src="assest/images/placeholderUser.png" style="width:23px"><span style="font-size:14px">${
                                      value.user_profile.display_name
                                    }</span>
                                    <img src="assest/images/envelope.png" style="width:15px;opacity: 0.8;margin-left: 5px;"><span style="padding-left:5px;font-size:14px">${
                                      value.user_profile.email
                                    }</span>
                                    <p style="padding-left: 3px;padding-top: 8px;">${App.relative_time(
                                      value.created_at
                                    )}</p>
                          </div>`;
            }
            $("#supports").append(html);
            $(".loading_imag").hide();
          });
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    get_feedbacks: function(type, qusetion, answer, faq_id) {
      jQuery.ajax({
        url: base + "/get_feedback",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".feedbacks").empty();
          if (data.length == 0) {
            var html = `<div class="col-md-12 col-sm-12 col-xs-12 shadow" style="margin-top:10px">
                             <p style="text-align:center;padding-top: 12px;padding-bottom: 5px;">No feedback recived</p>
                          </div>`;
            $(".feedbacks").append(html);
            $(".loading_imag").hide();
          }
          jQuery.each(data, function(index, value) {
            var html = `<div class="col-md-12 col-sm-12 col-xs-12 fad${
              value.id
            } shadow" style="width: 98.5%;margin-top:10px;padding-bottom: 0px;">
                            <span style="font-size: 12px;padding-right: 8px;position: absolute;right: 9px;top: 17px;">${App.relative_time(
                              value.created_at
                            )}</span>
                          <div class="col-md-12 col-sm-12 col-xs-12" data-id="${
                            value.id
                          }" style="padding:2px 0 5px 3px">
                            <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;padding-top: 6px;">Title</p>
                            <label style="margin-left: 5px;font-size:16px">${value.subject}</label>
                            <p style="font-size:12px;color:#716969;margin-bottom:0px;padding-left:5px;">Feedback</p>
                            <p style="margin-left: 5px;font-size:15px">${value.content}</p>
                           <img src="assest/images/placeholderUser.png" style="width:23px"><span style="font-size:14px">${
                             value.user_profile.display_name
                           }</span>
                           <img src="assest/images/envelope.png" style="width:15px;opacity: 0.8;margin-left: 18px;"><span style="padding-left:5px;font-size:14px">${
                             value.user_profile.email
                           }</span></p>
                          </div>
                      </div>`;
            $("#feedbacks").append(html);
            $(".loading_imag").hide();
          });
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    admin_analytics: function(type, qusetion, answer, faq_id) {
      jQuery.ajax({
        url: base + "/admin_analytics",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $(".feed_count").text(data[0].count);
          $(".job_count").text(data[1].count);
          $(".stylist_count").text(data[2].count);
          $(".salon_count").text(data[3].count);
          $(".bazaar_count").text(data[4].count);
          // $(".verified_count").text(data[5].count);
          $(".verified_count").text(data[10].result[1]);
          // $(".unverified_count").text(data[6].count);
          $(".unverified_count").text(data[9].result[1]);
          $(".profile_comp_count").text(data[7].count);
          $(".deactivaed_user_count").text(data[8].count);

        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    register_list: function(Platform, startDate, endDate, verifiedStatus, userStatus) {
      var input_data = {
        platform: Platform,
        startDate: startDate,
        endDate: endDate,
        verifiedStatus: parseInt(verifiedStatus),
        userStatus: parseInt(userStatus), 
      };
      jQuery.ajax({
        url: base + "/get_newusers",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          $("#table_data").empty();
         var html =`<table id="table_id" class="display">
           <thead>
            <tr>
             <th>S.No</th>
             <th>Date</th>
             <th>User Name</th>
             <th>Email</th>
             <th>Profile %</th>
             <th>Profile Complete/Incomplete</th>
             <th>User Status</th>
             <th>Platform</th>
            </tr>
           </thead>
          <tbody class="">`
          var user_device;
          jQuery.each(data, function(index, value) {
            if (value.user_devices.length) {
              user_device = value.user_devices[0].platform;
            } else {
              user_device = `Web`;
            }
            var date = new Date(value.modified_at);
            var create_date =
              date.getDate() +
              "/" +
              (date.getMonth() + 1) +
              "/" +
              date.getFullYear();
             html += `<tr>
                        <td>${index + 1}</td>
                        <td>${create_date}</td>
                        <td>${value.display_name}</td>
                        <td>${value.email}</td>
                        <td>${value.completionlevel}%</td>`
                         if(value.completionlevel == 0){
                            html += `<td>Incomplete</td>`;
                         }else{
                            html += `<td>Complete</td>`;
                         }
                        if(value.is_active == false){
                         html += `<td style="color:red">Deactivaed</td>`;
                        }else{
                         html += `<td style="color:green">Active</td>`;
                        }
                        html += `<td>${user_device}</td></tr>`;
           
          });
          html += `</tbody></table>`
          $("#table_data").append(html);
          $('#table_id').DataTable();
          $(".loading_imag").hide();
          // $(".load_register").hide();
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    unverify_users: function() {
      jQuery.ajax({
        url: base + "/get_unverifieduser",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
        $("#table_data1").empty();
         var html =`<table id="table_id1" class="display">
           <thead>
            <tr>
             <th>S.No</th>
             <th>Email</th>
            </tr>
           </thead>
          <tbody class="">`
          if(data.result.length > 0){
              jQuery.each(data.result, function(index, value) {
                if(index != 0){
                html += `<tr><td>${index}</td><td>${value[0]}</td>`;
                }
              });
            }
          html += `</tbody></table>`
          $("#table_data1").append(html);
          $('#table_id1').DataTable();
          $(".loading_imag").hide();
          // $(".load_register").hide();
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    comment_report_count: function(post_id) {
      var input_data = {
        post_id: post_id
      };
      jQuery.ajax({
        url: base + "/comment_report_count",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token")
        },
        data: JSON.stringify(input_data),
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          if(data.count == 0){
            $(".show_reported_comments").hide()
          }else{
            $(".show_reported_comments").show()
          }
          $(".count_report").text(data.count);
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    },
    report_user: function(user_id) {
      jQuery.ajax({
        url: base + "/reported_user",
        dataType: "json",
        type: "POST",
        headers: { "user-name": user_id },
        contentType: "application/json",
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          jQuery.each(data, function(index, value) {
            var html = `<div class="col-md-12" style="padding: 10px 15px">
                         <div class="col-md-2" style="padding: 0;display: inline-block; width: unset;">
                           <img class="like_profile" src=${value.reported_user_profile.profile_pic != "" ? value.reported_user_profile.profile_pic : `assest/images/user.png`}  style="width:60px; height:60px;border-radius: 55px;"> 
                         </div>
                         <div class="col-md-10">`
                         if (value.reason){
                            html += `<p style="font-weight: 700;padding-top: 4px;margin-bottom: 7px;"><b>${value.reported_user_profile.display_name}</b></p>
                              <span style="background-color: #dedede;padding: 3px 10px;border-radius: 25px;font-size: 13px;">${value.reason.name}</span>
                              </div></div>`;
                             }else{
                                html += `<p style="margin-top: 15px;font-weight: 700;padding-top: 4px;margin-bottom: 7px;"><b>${value.reported_user_profile.display_name}</b></p>`;
                           }
                           
                          $("#reported_user_info").append(html);
                        });
                        $("#repot_load").hide();
                      },
        error: function(jqXhr, textStatus, errorThrown) {
          consol.log(jqXhr);
        }
      });
    },
    notification_cout: function() {
      jQuery.ajax({
        url: base + "/get_notify_unread_count",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        crossDomain: true,
        processData: false,
        success: function(data, textStatus, jQxhr) {
          if (data.count !== 0 && data.count < 10) {
            var html = ` <p class="notification_text" style="color: #fff;background-color: #fd3c2e;border-radius: 19px;height: 13px;width: 14px;font-size: 10px;">${
              data.count
            }</p>`;
          } else if (data.count > 9) {
            var html = ` <p class="notification_text" style="color: #fff;background-color: #fd3c2e;border-radius: 19px;height: 13px;width: 14px;font-size: 10px;">9+</p>`;
          } else {
            var html = ` <p class="notification_text" style="color: #fff;background-color: #fd3c2e;border-radius: 19px;height: 13px;width: 14px;font-size: 10px; display: none;">0</p>`;
          }
          $(".notification_mark").append(html);
        },
        error: function(jqXhr, textStatus, errorThrown) {}
      });
    }
  };
})();
const sendOutPushNotification = (message, id) => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    spawnNotification(message, "assest/images/Ziba.png", "zibaHub", id);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission(function(permission) {
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }
};
function spawnNotification(theBody, theIcon, theTitle, id) {
  var options = {
    body: theBody,
    icon: theIcon
  };
  $(window)
    .focus(function() {})
    .blur(function() {});
  var n = new Notification(theTitle, options);
  n.onclick = function(event) {
    window.focus();
    if (id != 1) {
      $(".notification_admin").trigger("click");
    }
  };
}
