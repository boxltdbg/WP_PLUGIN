<?php

function box_now_delivery_menu()
{
  add_menu_page(
    'BOX NOW Delivery',
    'BOX NOW Delivery',
    'manage_options',
    'box-now-delivery',
    'box_now_delivery_options',
    'dashicons-location',
    80
  );
}

require_once 'box-now-delivery-validation.php';

function box_now_delivery_enqueue_admin_scripts($hook)
{
  if ($hook != 'toplevel_page_box-now-delivery') {
    return;
  }

  wp_enqueue_script('box_now_delivery_admin_page_script', plugins_url('../js/box-now-delivery-admin-page.js', __FILE__), array(), '1.0', true);
}

add_action('admin_enqueue_scripts', 'box_now_delivery_enqueue_admin_scripts');

function box_now_delivery_options()
{
?>
  <div class="wrap">
    <h1>BOX NOW Bulgaria Plugin</h1>
    <?php settings_fields('box-now-delivery-settings-group'); ?>
    <?php do_settings_sections('box-now-delivery-settings-group'); ?>
    <label style="width: 100%; float: left;">Благодаря Ви, че избрахте BOX NOW за Ваш доверен партньор в процеса по доставка! За да научите повече за предлаганите от нас услуги, посетете <a href="https://boxnow.bg/">BOX NOW</a> или се свържете с нас на <a href="mailto:integrationsupport@boxnow.bg">integrationsupport@boxnow.bg</a>.</label>
    <br>
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
      <input type="hidden" name="action" value="boxnow-settings-save">
      <?php wp_nonce_field('boxnow-settings-save', 'boxnow-custom-message'); ?>

      <div id="main-container">
        <!-- Checkout Type Selection -->
        <h2 style="width: 100%; float: left;">Тип на чекаут</h2>
        <div style="width: 100%; float: left;">
          <p>
            <input type="radio" id="checkout_type_classic" name="boxnow_checkout_type" value="classic" <?php checked(get_option('boxnow_checkout_type', 'classic'), 'classic'); ?>>
            <label for="checkout_type_classic">Classic Checkout</label>
          </p>
          <p>
            <input type="radio" id="checkout_type_block" name="boxnow_checkout_type" value="block" <?php checked(get_option('boxnow_checkout_type', 'classic'), 'block'); ?>>
            <label for="checkout_type_block">Block-based Checkout</label>
          </p>
        </div>

        <h2 style="width: 100%; float: left;">Вашите данни за достъп</h2>
        <div style="width:30%; float: left;">
          <p>
            <label>Вашият API URL:</label>
            <br />
            <input type="text" name="boxnow_api_url" value="<?php echo esc_attr(get_option('boxnow_api_url', '')); ?>" placeholder="Enter your API URL without the http:// or https:// prefix" />
          </p>
          <p>
            <label>Номер на склад(ове):</label>
            <br />
            <input type="text" name="boxnow_warehouse_id" value="<?php echo esc_attr(get_option('boxnow_warehouse_id', '')); ?>" placeholder="Enter your Warehouse ID" />
          </p>
        </div>
        <div style="width:30%; float: left;">
          <p>
            <label>Вашият Client ID:</label>
            <br />
            <input type="text" name="boxnow_client_id" value="<?php echo esc_attr(get_option('boxnow_client_id', '')); ?>" placeholder="Enter your Client ID" />
          </p>
          <p>
            <label>Вашият Partner ID / Номер на партньор:</label>
            <br />
            <input type="text" name="boxnow_partner_id" value="<?php echo esc_attr(get_option('boxnow_partner_id', '')); ?>" placeholder="Enter your Partner ID" />
          </p>
        </div>
        <div style="width:30%; float: left;">
          <p>
            <label>Вашият Client Secret:</label>
            <br />
            <input type="text" name="boxnow_client_secret" value="<?php echo esc_attr(get_option('boxnow_client_secret', '')); ?>" placeholder="Enter your Client Secret" />
          </p>
        </div>
        <label style="width: 100%; float: left;">Ако имате повече от 1 склад, разделете техните ID-а със запетайка.</label>

        <h2 style="width: 100%; float: left;">Редакция на бутон "Избери BOX NOW автомат"</h2>
        <div style="width:30%; float: left;">
          <p>
            <label>Промени цвета на бутона:</label>
            <br />
            <input type="text" name="boxnow_button_color" value="<?php echo esc_attr(get_option('boxnow_button_color', '#84C33F')); ?>" placeholder="#84C33F" />
          </p>
        </div>
        <div style="width:30%; float: left;">
          <p>
            <label>Промени текста на бутона:</label>
            <br />
            <input type="text" id="button_text_input" name="boxnow_button_text" value="<?php echo esc_attr(get_option('boxnow_button_text', 'Избери BOX NOW автомат')); ?>" placeholder="Избери BOX NOW автомат" />
          </p>
        </div>

        <h2 style="width: 100%; float: left;">Редакция на картата</h2>
        <div style="width: 100%; float: left;">
          <p>
            <input type="radio" id="box_now_display_mode_popup" name="box_now_display_mode" value="popup" <?php checked(get_option('box_now_display_mode', 'popup'), 'popup'); ?>>
            <label for="box_now_display_mode_popup">Тип модален pop-up прозорец</label>
          </p>
          <p>
            <input type="radio" id="box_now_display_mode_embedded" name="box_now_display_mode" value="embedded" <?php checked(get_option('box_now_display_mode', 'popup'), 'embedded'); ?>>
            <label for="box_now_display_mode_embedded">Тип iFrame</label>
          </p>
        </div>

        <h2 style="width: 100%; float: left;">Разрешаване на GPS локиране</h2>
        <div style="width: 100%; float: left;">
          <p>
            <input type="radio" id="gps_tracking_on" name="boxnow_gps_tracking" value="on" <?php checked(get_option('boxnow_gps_tracking', 'on'), 'on'); ?>>
            <label for="gps_tracking_on">Включено</label>
          </p>
          <p>
            <input type="radio" id="gps_tracking_off" name="boxnow_gps_tracking" value="off" <?php checked(get_option('boxnow_gps_tracking', 'on'), 'off'); ?>>
            <label for="gps_tracking_off">Изключено</label>
          </p>
        </div>

        <h2 style="width: 100%; float: left;">Тип на товарителницата</h2>
        <div style="width: 100%; float: left;">
          <p>
            <input type="radio" id="send_voucher_email" name="boxnow_voucher_option" value="email" <?php checked(get_option('boxnow_voucher_option', 'email'), 'email'); ?>>
            <label for="send_voucher_email">Товарителница по email</label>
          </p>
          <div id="email_input_container" style="width: 100%; float: left; display: <?php echo (get_option('boxnow_voucher_option', 'email') === 'email') ? 'block' : 'none'; ?>;">
            <p>
              <label>Моля напишете Вашият e-mail адрес тук:</label>
              <br />
              <input type="text" name="boxnow_voucher_email" value="<?php echo esc_attr(get_option('boxnow_voucher_email', '')); ?>" placeholder="Моля напишете Вашият e-mail адрес тук" />
            <p id="email_validation_message" style="color: red;"></p>
            </p>
            <br />
          </div>
          <p>
            <input type="radio" id="display_voucher_button" name="boxnow_voucher_option" value="button" <?php checked(get_option('boxnow_voucher_option', 'email'), 'button'); ?>>
            <label for="display_voucher_button">Покажи бутон в административният панел на WooCoomerce поръчки - за печат на Товарителница</label>
          </p>
        </div>

        <h2 style="width: 100%; float: left;">Съобщение, което да бъде показано, когато не е избран автомат</h2>
        <div style="width: 30%; float: left;">
          <p>
            <label>Съобщение:</label>
            <br />
            <input type="text" name="boxnow_locker_not_selected_message" value="<?php echo esc_attr(get_option('boxnow_locker_not_selected_message', '')); ?>" placeholder="Въведете желаното съобщение" />
          </p>
        </div>

        <div style="width:100%; float: left; clear: both;">
          <?php submit_button(); ?>
        </div>
      </div>
    </form>
  </div>
<?php
}

function box_now_delivery_settings()
{
  $serializer = new BNDP_Serializer();
  $serializer->init();
}

add_action('admin_menu', 'box_now_delivery_menu');
add_action('admin_init', 'box_now_delivery_settings');

function box_now_delivery_enqueue_admin_styles($hook)
{
  if ($hook != 'toplevel_page_box-now-delivery') {
    return;
  }

  wp_register_style('box_now_delivery_admin_styles', plugin_dir_url(__FILE__) . '../css/box-now-delivery-admin.css');
  wp_enqueue_style('box_now_delivery_admin_styles');
}
add_action('admin_enqueue_scripts', 'box_now_delivery_enqueue_admin_styles');

function box_now_delivery_enqueue_styles()
{
  wp_register_style('box_now_delivery_styles', plugin_dir_url(__FILE__) . '../css/box-now-delivery.css', array(), '1.0.0');
  wp_enqueue_style('box_now_delivery_styles');
}
add_action('admin_enqueue_scripts', 'box_now_delivery_enqueue_styles');
