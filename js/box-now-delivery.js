(function ($) {
  var checkoutType = boxNowDeliverySettings.checkoutType || 'classic';

  if (checkoutType === 'classic') {
    // CLASSIC CHECKOUT LOGIC

    function addButton() {
      if (
        $("#box_now_delivery_button").length === 0 &&
        boxNowDeliverySettings.displayMode === "popup"
      ) {
        var buttonText = boxNowDeliverySettings.buttonText || "Избери BOX NOW автомат";

        $('label[for="shipping_method_0_box_now_delivery"]').after(
          '<button type="button" id="box_now_delivery_button" style="display:none;">' +
            buttonText +
            "</button>"
        );

        attachButtonClickListener();
      } else if (boxNowDeliverySettings.displayMode === "embedded") {
        $('label[for="shipping_method_0_box_now_delivery"]').after(
          '<div id="box_now_delivery_embedded_map" style="display:none;"></div>'
        );
        embedMap();
      }
      
      applyButtonStyles();
    }

    function applyButtonStyles() {
      var buttonColor = boxNowDeliverySettings.buttonColor || "#84C33F";

      if ($("#box-now-delivery-button-styles").length === 0) {
        var styleBlock = `
          <style id="box-now-delivery-button-styles">
            #box_now_delivery_button {
              background-color: ${buttonColor} !important;
              color: #fff !important;
            }
          </style>
        `;

        $("head").append(styleBlock);
      }
    }

    function attachButtonClickListener() {
      $("#box_now_delivery_button").on("click", function (event) {
        event.preventDefault();
        createPopupMap();
      });
    }

    function embedMap() {
      var iframe = $("#box_now_delivery_embedded_map iframe");

      if (iframe.length === 0) {
        iframe = createEmbeddedIframe();

        var lockerDetailsContainer = $("<div>", {
          id: "box_now_selected_locker_details",
          css: {
            display: "none",
            marginTop: "10px",
          },
        });

        var lockerInfoContainer = $("<div>", {
          id: "locker_info_container",
        });

        $("#box_now_delivery_embedded_map")
          .css({
            position: "relative",
            width: "100%",
            height: "100%",
            marginBottom: "12px",
          })
          .append(iframe)
          .append(lockerInfoContainer.append(lockerDetailsContainer));

        iframe.on("load", function () {
          window.addEventListener("message", function (event) {
            if (typeof event.data.boxnowClose !== "undefined") {
              // Handle close event
            } else {
              updateLockerDetailsContainer(event.data);
            }
          });
        });
      }

      if ($("#shipping_method_0_box_now_delivery").is(":checked") || !$('input[name="shipping_method[0]"]:checked').val()) {
        $(".woocommerce-shipping-fields").append($("#box_now_delivery_embedded_map"));
        $("#box_now_delivery_embedded_map").show();
      } else {
        $("#box_now_delivery_embedded_map").hide();
      }
    }

    function createOverlay() {
      var overlay = $("<div>", {
        id: "box_now_delivery_overlay",
        css: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0)",
          zIndex: 9998,
        },
      });

      overlay.on("click", function () {
        $("#box_now_delivery_overlay").remove();
        $("iframe[src^='https://widget-v5.boxnow.bg/popup.html']").remove();
      });

      $("body").append(overlay);
    }

    function createPopupMap() {
      let gpsOption = boxNowDeliverySettings.gps_option;
      let postalCode = $('input[name="billing_postcode"]').val();
      let src = "https://widget-v5.boxnow.bg/popup.html";

      if (gpsOption === "off") {
        src +=
          "?gps=no&zip=" +
          encodeURIComponent(postalCode) +
          "&autoclose=yes&autoselect=no";
      } else {
        src += "?gps=yes&autoclose=yes&autoselect=no";
      }

      let iframe = $("<iframe>", {
        src: src,
        css: {
          position: "fixed",
          top: "50%",
          left: "50%",
          width: "80%",
          height: "80%",
          border: 0,
          borderRadius: "20px",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        },
      });

      window.addEventListener("message", function (event) {
        if (
          event.data === "closeIframe" ||
          event.data.boxnowClose !== undefined
        ) {
          $("#box_now_delivery_overlay").remove();
          iframe.remove();
        } else {
          updateLockerDetailsContainer(event.data);
        }
      });

      createOverlay();
      $("body").append(iframe);
    }

    function createEmbeddedIframe() {
      let gpsOption = boxNowDeliverySettings.gps_option;
      let postalCode = $('input[name="billing_postcode"]').val();
      let src = "https://widget-v5.boxnow.bg/";

      if (gpsOption === "off") {
        src += "?gps=no&zip=" + encodeURIComponent(postalCode);
      } else {
        src += "?gps=yes";
      }

      return $("<iframe>", {
        src: src,
        css: {
          width: "100%",
          height: "650px",
          border: 0,
        },
      });
    }

    window.addEventListener("message", function (event) {
      if (typeof event.data.boxnowClose !== "undefined") {
        // handle close
        if (boxNowDeliverySettings.displayMode === "popup") {
          $(".boxnow-popup").remove();
        }
      } else {
        updateLockerDetailsContainer(event.data);
        showSelectedLockerDetailsFromLocalStorage();
      }
    });

    function updateLockerDetailsContainer(lockerData) {
      if (
        lockerData.boxnowLockerId === undefined ||
        lockerData.boxnowLockerAddressLine1 === undefined ||
        lockerData.boxnowLockerPostalCode === undefined ||
        lockerData.boxnowLockerName === undefined
      ) {
        return;
      }

      var locker_id = lockerData.boxnowLockerId;
      var locker_address = lockerData.boxnowLockerAddressLine1;
      var locker_name = lockerData.boxnowLockerName;

      localStorage.setItem("box_now_selected_locker", JSON.stringify(lockerData));

      if ($("#box_now_selected_locker_details").length === 0) {
        $("#box_now_delivery_button").after(
          '<div id="box_now_selected_locker_details" style="display:none;"></div>'
        );
      }

      if ($("#_boxnow_locker_id").length === 0) {
        $("<input>")
          .attr({
            type: "hidden",
            id: "_boxnow_locker_id",
            name: "_boxnow_locker_id",
            value: locker_id,
          })
          .appendTo("#box_now_selected_locker_details");
      } else {
        $("#_boxnow_locker_id").val(locker_id);
      }

      var language = document.documentElement.lang || "bg";

      var bulgarianContent = `
<div style="font-family: Arial, sans-serif; margin-top: 10px;">
  <p style="margin-bottom: 10px; color: rgb(132 195 62);"><b>Избран автомат</b></p>
  <p style="margin-bottom: 5px; font-size: 14px;"><b>Име на автомат: </b> ${locker_name}</p>
  <p style="margin-bottom: 5px; font-size: 14px;"><b>Адрес на автомат:</b> ${locker_address}</p>
</div>`;

      var englishContent = `
<div style="font-family: Arial, sans-serif; margin-top: 10px;">
  <p style="margin-bottom: 10px; color: rgb(132 195 62);"><b>Избран автомат</b></p>
  <p style="margin-bottom: 5px; font-size: 14px;"><b>Име на автомат:</b> ${locker_name}</p>
  <p style="margin-bottom: 5px; font-size: 14px;"><b>Адрес на автомат:</b> ${locker_address}</p>
</div>`;

      var content = language === "bg" ? bulgarianContent : englishContent;

      $("#box_now_selected_locker_details").html(content).show();

      if ($("#box_now_selected_locker_input").length === 0) {
        $("<input>")
          .attr({
            type: "hidden",
            id: "box_now_selected_locker_input",
            name: "box_now_selected_locker",
            value: JSON.stringify(lockerData),
          })
          .appendTo("#box_now_selected_locker_details");
      } else {
        $("#box_now_selected_locker_input").val(JSON.stringify(lockerData));
      }

      if (boxNowDeliverySettings.displayMode === "popup") {
        $("#box_now_delivery_overlay").remove();
        $("iframe[src^='https://widget-v5.boxnow.bg/popup.html']").remove();
      }
    }

    function showSelectedLockerDetailsFromLocalStorage() {
      var lockerData = localStorage.getItem("box_now_selected_locker");

      if (lockerData) {
        updateLockerDetailsContainer(JSON.parse(lockerData));
      }
    }

    function toggleBoxNowDeliveryButton() {
      if ($("#shipping_method_0_box_now_delivery").is(":checked") || !$('input[name="shipping_method[0]"]:checked').val()) {
        $("#box_now_delivery_button")
          .css("background-color", boxNowDeliverySettings.buttonColor)
          .show();
      } else {
        $("#box_now_delivery_button").hide();
      }
    }

    function toggleBoxNowDelivery() {
      if (boxNowDeliverySettings.displayMode === "popup") {
        toggleBoxNowDeliveryButton();
      } else if (boxNowDeliverySettings.displayMode === "embedded") {
        embedMap();
      }
    }

    function clearSelectedLockerDetails() {
      localStorage.removeItem("box_now_selected_locker");
      $("#box_now_selected_locker_details").hide().empty();
    }

    $(document).ready(function () {
      function addOrderValidation() {
        $(document.body).on("click", "#place_order", function (event) {
          var lockerData = localStorage.getItem("box_now_selected_locker");

          if (
            !lockerData &&
            $('input[type="radio"][name="shipping_method[0]"]:checked').val() ===
              "box_now_delivery"
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
            alert(
              boxNowDeliverySettings.lockerNotSelectedMessage ||
                "Моля първо изберете автомат!"
            );
            return false;
          }
        });
      }

      addButton();
      toggleBoxNowDelivery();
      showSelectedLockerDetailsFromLocalStorage();

      $(document.body).on("updated_checkout", function () {
        addButton();
        toggleBoxNowDelivery();
      });

      $(document.body).on(
        "change",
        'input[type="radio"][name="shipping_method[0]"]',
        toggleBoxNowDelivery
      );

      addOrderValidation();
    });

  } else if (checkoutType === 'block') {
    // BLOCK-BASED CHECKOUT LOGIC

    /**
     * Clears locker data from the session.
     */
    function clearLockerIdInSession() {
      $.ajax({
        url: boxNowDeliverySettings.ajax_url,
        type: "POST",
        data: {
          action: "set_boxnow_locker_id",
          locker_id: "",
        },
        success: function () {
          console.log("Box Now locker session cleared.");
        },
        error: function () {
          console.error("Failed to clear Box Now locker session.");
        },
      });
    }

    /**
     * Stores the selected locker ID in the session.
     */
    function storeLockerIdInSession(lockerId) {
      if (!lockerId) {
        console.error("No locker ID provided.");
        return;
      }

      $.ajax({
        url: boxNowDeliverySettings.ajax_url,
        type: "POST",
        data: {
          action: "set_boxnow_locker_id",
          locker_id: lockerId,
        },
        success: function (response) {
          if (response.success) {
            console.log("Locker ID stored in session successfully:", lockerId);
          } else {
            console.error("Failed to store locker ID:", response.data);
          }
        },
        error: function () {
          console.error("Error occurred while storing locker ID in session.");
        },
      });
    }

    function addButton() {
      var boxNowInput = findBoxNowInput();
      if (boxNowInput.length > 0) {
        var parentOption = boxNowInput.closest(
          ".wc-block-components-radio-control__option"
        );

        if (
          $("#box_now_delivery_button").length === 0 &&
          boxNowDeliverySettings.displayMode === "popup"
        ) {
          var buttonText =
            boxNowDeliverySettings.buttonText || "Избери BOX NOW автомат";
          parentOption.append(
            '<button type="button" id="box_now_delivery_button" style="display:none; margin-top:10px;">' +
              buttonText +
              "</button>"
          );
          attachButtonClickListener();
        }

        if (
          $("#box_now_delivery_embedded_map").length === 0 &&
          boxNowDeliverySettings.displayMode === "embedded"
        ) {
          parentOption.after(
            '<div id="box_now_delivery_embedded_map" style="display:none; margin-top:15px;"></div>'
          );
          embedMap();
        }

        applyButtonStyles();
      }
    }

    function findBoxNowInput() {
      return $(
        ".wc-block-components-radio-control__input[value='box_now_delivery']"
      );
    }

    function applyButtonStyles() {
      var buttonColor = boxNowDeliverySettings.buttonColor || "#84C33F";

      if ($("#box-now-delivery-button-styles").length === 0) {
        var styleBlock = `
          <style id="box-now-delivery-button-styles">
            #box_now_delivery_button {
              background-color: ${buttonColor} !important;
              color: #fff !important;
              cursor: pointer !important;
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              transition: background-color 0.3s, cursor 0.3s;
            }
            #box_now_delivery_button.disabled {
              background-color: #cccccc !important;
              cursor: not-allowed !important;
            }
            .wc-block-components-checkout-place-order-button.disabled {
              background-color: #cccccc !important;
              cursor: not-allowed !important;
              pointer-events: none;
            }
            .boxnow-error-message {
              color: red;
              margin-left: 10px;
              font-size: 14px;
              font-weight: bold;
              opacity: 0;
              transition: opacity 0.3s ease-in-out;
            }
            .boxnow-error-message.show {
              opacity: 1;
            }
          </style>
        `;
        $("head").append(styleBlock);
      }
    }

    function attachButtonClickListener() {
      $("#box_now_delivery_button")
        .off("click")
        .on("click", function (event) {
          event.preventDefault();
          createPopupMap();
        });
    }

    function embedMap() {
      var iframe = $("#box_now_delivery_embedded_map iframe");

      if (iframe.length === 0) {
        iframe = createEmbeddedIframe();

        var lockerDetailsContainer = $("<div>", {
          id: "box_now_selected_locker_details",
          css: {
            display: "none",
            marginTop: "10px",
          },
        });

        var lockerInfoContainer = $("<div>", {
          id: "locker_info_container",
        });

        $("#box_now_delivery_embedded_map")
          .css({
            position: "relative",
            width: "100%",
            height: "100%",
            marginBottom: "12px",
          })
          .append(iframe)
          .append(lockerInfoContainer.append(lockerDetailsContainer));
      }

      toggleBoxNowDelivery();
    }

    function createEmbeddedIframe() {
      let gpsOption = boxNowDeliverySettings.gps_option;
      let postalCode = $('input[name="billing_postcode"]').val() || "";
      let src = "https://widget-v5.boxnow.bg/";

      if (gpsOption === "off") {
        src += "?gps=no&zip=" + encodeURIComponent(postalCode);
      } else {
        src += "?gps=yes";
      }

      return $("<iframe>", {
        src: src,
        css: {
          width: "100%",
          height: "650px",
          border: 0,
        },
      });
    }

    function createPopupMap() {
      let gpsOption = boxNowDeliverySettings.gps_option;
      let postalCode = $("input[name='billing_postcode']").val() || "";
      let src = "https://widget-v5.boxnow.bg/popup.html";

      if (gpsOption === "off") {
        src +=
          "?gps=no&zip=" +
          encodeURIComponent(postalCode) +
          "&autoclose=yes&autoselect=no";
      } else {
        src += "?gps=yes&autoclose=yes&autoselect=no";
      }

      let iframe = $("<iframe>", {
        src: src,
        css: {
          position: "fixed",
          top: "50%",
          left: "50%",
          width: "80%",
          height: "80%",
          border: 0,
          borderRadius: "20px",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        },
      });

      createOverlay();
      $("body").append(iframe);
    }

    function createOverlay() {
      var overlay = $("<div>", {
        id: "box_now_delivery_overlay",
        css: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        },
      });

      overlay.on("click", function () {
        $("#box_now_delivery_overlay").remove();
        $("iframe[src^='https://widget-v5.boxnow.bg/popup.html']").remove();
      });

      $("body").append(overlay);
    }

    window.addEventListener("message", function (event) {
      if (
        event.data === "closeIframe" ||
        event.data.boxnowClose !== undefined
      ) {
        $("#box_now_delivery_overlay").remove();
        $("iframe[src^='https://widget-v5.boxnow.bg/popup.html']").remove();
      } else {
        updateLockerDetailsContainer(event.data);
      }
    });

    function updateLockerDetailsContainer(lockerData) {
      if (
        lockerData.boxnowLockerId === undefined ||
        lockerData.boxnowLockerAddressLine1 === undefined ||
        lockerData.boxnowLockerPostalCode === undefined ||
        lockerData.boxnowLockerName === undefined
      ) {
        console.warn("Incomplete locker data received.");
        return;
      }

      var locker_id = lockerData.boxnowLockerId;
      var locker_address = lockerData.boxnowLockerAddressLine1;
      var locker_name = lockerData.boxnowLockerName;

      localStorage.setItem("box_now_selected_locker", JSON.stringify(lockerData));

      if ($("#box_now_selected_locker_details").length === 0) {
        if (boxNowDeliverySettings.displayMode === "popup") {
          $("#box_now_delivery_button").after(
            '<div id="box_now_selected_locker_details" style="display:none;"></div>'
          );
        }
      }

      var content = `
        <div style="font-family: Arial, sans-serif; margin-top: 10px;">
          <p style="margin-bottom: 10px; color: rgb(132, 195, 62);"><strong>Избран автомат</strong></p>
          <p style="margin-bottom: 5px; font-size: 14px;"><strong>Име на автомат:</strong> ${locker_name}</p>
          <p style="margin-bottom: 5px; font-size: 14px;"><strong>Адрес на автомат:</strong> ${locker_address}</p>
        </div>`;

      $("#box_now_selected_locker_details").html(content).show();

      if ($("#box_now_selected_locker_input").length === 0) {
        $("<input>")
          .attr({
            type: "hidden",
            id: "box_now_selected_locker_input",
            name: "box_now_selected_locker",
            value: JSON.stringify(lockerData),
          })
          .appendTo("#box_now_selected_locker_details");
      } else {
        $("#box_now_selected_locker_input").val(JSON.stringify(lockerData));
      }

      if (boxNowDeliverySettings.displayMode === "popup") {
        $("#box_now_delivery_overlay").remove();
        $("iframe[src^='https://widget-v5.boxnow.bg/popup.html']").remove();
      }

      storeLockerIdInSession(locker_id);
      removeErrorMessage();
      togglePlaceOrderButton();
    }

    function showSelectedLockerDetailsFromLocalStorage() {
      var lockerData = localStorage.getItem("box_now_selected_locker");
      if (lockerData) {
        updateLockerDetailsContainer(JSON.parse(lockerData));
      }
    }

    function isLockerSelected() {
      const lockerData = localStorage.getItem("box_now_selected_locker");
      if (lockerData) {
        try {
          const parsedData = JSON.parse(lockerData);
          return (
            parsedData.boxnowLockerId !== undefined &&
            parsedData.boxnowLockerId !== ""
          );
        } catch (e) {
          console.error("Error parsing locker data:", e);
          return false;
        }
      }
      return false;
    }

    function isBoxNowDeliverySelected() {
      var boxNowInput = findBoxNowInput();
      return boxNowInput.is(":checked");
    }

    function handleOrderSubmission(event) {
      if (isBoxNowDeliverySelected() && !isLockerSelected()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        alert("Моля изберете BOX NOW автомат!");
        $('html, body').animate({
          scrollTop: $("#box_now_delivery_button").offset().top - 100
        }, 500, function() {
          $("#box_now_delivery_button").focus();
        });
        return false;
      }
    }

    function attachOrderPrevention() {
      $("form.checkout").off("submit").on("submit", handleOrderSubmission);
      $(document).off("click.boxnow").on("click.boxnow", ".wc-block-components-checkout-place-order-button", function (event) {
        if (isBoxNowDeliverySelected() && !isLockerSelected()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          alert("Моля изберете BOX NOW автомат!");
          $('html, body').animate({
            scrollTop: $("#box_now_delivery_button").offset().top - 100
          }, 500, function() {
            $("#box_now_delivery_button").focus();
          });
          return false;
        }
      });
    }

    function appendErrorMessage() {
      if (boxNowDeliverySettings.displayMode === "popup") {
        var lockerButton = $("#box_now_delivery_button");
        if (lockerButton.length > 0 && lockerButton.next(".boxnow-error-message").length === 0) {
          lockerButton.after('<span class="boxnow-error-message show">Моля изберете автомат за доставка</span>');
        }
      } else if (boxNowDeliverySettings.displayMode === "embedded") {
        var embeddedMap = $("#box_now_delivery_embedded_map");
        if (embeddedMap.length > 0 && embeddedMap.next(".boxnow-error-message").length === 0) {
          embeddedMap.after('<span class="boxnow-error-message show">Моля изберете автомат за доставка</span>');
        }
      }
    }

    function removeErrorMessage() {
      if (boxNowDeliverySettings.displayMode === "popup") {
        $("#box_now_delivery_button").next(".boxnow-error-message").removeClass("show").remove();
      } else if (boxNowDeliverySettings.displayMode === "embedded") {
        $("#box_now_delivery_embedded_map").next(".boxnow-error-message").removeClass("show").remove();
      }

      if ($("#box_now_selected_locker_details").is(":visible")) {
        $("#box_now_selected_locker_details").siblings(".boxnow-error-message").removeClass("show").remove();
      }
    }

    function togglePlaceOrderButton() {
      const isBoxNow = isBoxNowDeliverySelected();
      const hasLocker = isLockerSelected();
      const placeOrderButton = $(".wc-block-components-checkout-place-order-button");
      
      if (isBoxNow && !hasLocker) {
        placeOrderButton.addClass("disabled");
        appendErrorMessage();
      } else {
        placeOrderButton.removeClass("disabled");
        removeErrorMessage();
      }
    }

    function toggleBoxNowDelivery() {
      var boxNowInput = findBoxNowInput();
      if (boxNowInput.is(":checked")) {
        $("#box_now_delivery_button").show();
        $("#box_now_selected_locker_details").show();
        $("#box_now_delivery_embedded_map").show();
      } else {
        $("#box_now_delivery_button").hide();
        $("#box_now_selected_locker_details").hide();
        $("#box_now_delivery_embedded_map").hide();
        clearSelectedLockerDetails();
        clearLockerIdInSession();
      }
      togglePlaceOrderButton();
    }

    function clearSelectedLockerDetails() {
      localStorage.removeItem("box_now_selected_locker");
      $("#box_now_selected_locker_details").hide().empty();
      storeLockerIdInSession("");
      togglePlaceOrderButton();
    }

    function init() {
      if (init.initialized) {
        toggleBoxNowDelivery();
        togglePlaceOrderButton();
        return;
      }
      init.initialized = true;

      clearLockerIdInSession();
      localStorage.removeItem("box_now_selected_locker");

      addButton();
      toggleBoxNowDelivery();

      $(document).off("change.boxnow").on(
        "change.boxnow",
        ".wc-block-components-radio-control__input",
        function () {
          toggleBoxNowDelivery();
          togglePlaceOrderButton();
        }
      );

      attachOrderPrevention();
      togglePlaceOrderButton();
    }

    $(window).on("load", function () {
      window.addEventListener("message", function (event) {
        if (
          event.data === "closeIframe" ||
          event.data.boxnowClose !== undefined
        ) {
          $("#box_now_delivery_overlay").remove();
          $("iframe[src^='https://widget-v5.boxnow.bg/popup.html']").remove();
        } else {
          updateLockerDetailsContainer(event.data);
        }
      });

      init();
      showSelectedLockerDetailsFromLocalStorage();

      $(document.body).on(
        "wc_blocks_cart_update wc_blocks_checkout_update",
        function () {
          toggleBoxNowDelivery();
          togglePlaceOrderButton();
        }
      );
    });

  }
})(jQuery);
