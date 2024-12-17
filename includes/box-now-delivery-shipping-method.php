<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

add_action('plugins_loaded', 'box_now_delivery_shipping_method');

/**
 * Initialize the Box Now Delivery shipping method.
 */
function box_now_delivery_shipping_method()
{
    if (!class_exists('Box_Now_Delivery_Shipping_Method')) {
        /**
         * Class Box_Now_Delivery_Shipping_Method
         *
         * @property array $form_fields
         */
        class Box_Now_Delivery_Shipping_Method extends WC_Shipping_Method
        {
            /**
             * Constructor for the shipping class.
             */
            public function __construct($instance_id = 0)
            {
                $this->id = 'box_now_delivery';
                $this->instance_id = absint($instance_id);
                $this->method_title = __('BOX NOW Bulgaria', 'box-now-delivery');
                $this->method_description = __('Настройки за BOX NOW Bulgaria', 'box-now-delivery');

                $this->supports = array(
                    'shipping-zones',
                    'instance-settings',
                    'instance-settings-modal',
                );

                $this->init();

                // Load the settings.
                $this->init_settings();

                // Define user set variables.
                $this->title = $this->get_option('title');
                $this->cost = $this->get_option('cost');
                $this->free_delivery_threshold = $this->get_option('free_delivery_threshold');
                $this->taxable = $this->get_option('taxable');
            }

            /**
             * Initialize settings and form fields.
             */
            public function init()
            {
                $this->init_form_fields();
                $this->init_settings();
            }

            /**
             * Processes and saves options.
             * If there is an error thrown, will continue to save and validate fields, but will leave the erroring field out.
             *
             * @return bool was anything saved?
             */
            public function process_admin_options()
            {
                $this->init_settings();

                $post_data = $this->get_post_data();

                foreach ($this->get_form_fields() as $key => $field) {
                    if ('title' !== $this->get_field_type($field)) {
                        try {
                            $this->settings[$key] = $this->get_field_value($key, $field, $post_data);
                        } catch (Exception $e) {
                            $this->add_error($e->getMessage());
                        }
                    }
                }

                return update_option($this->get_option_key(), apply_filters('woocommerce_settings_api_sanitized_fields_' . $this->id, $this->settings), 'yes');
            }

            public function get_option_key()
            {
                return $this->plugin_id . $this->id . '_' . $this->instance_id . '_settings';
            }

            /**
             * Define settings fields for the shipping method.
             */
            public function init_form_fields()
            {
                $this->form_fields = array(
                    'enabled' => array(
                        'title' => __('Включено / Изключено', 'box-now-delivery'),
                        'type' => 'checkbox',
                        'description' => 'Включване и изключване на метода за доставка BOX NOW',
                        'default' => 'yes',
                    ),
                    'title' => array(
                        'title' => __('Име на метода за доставка', 'box-now-delivery'),
                        'type' => 'text',
                        'description' => __('Име наметода за доставка, което вижда клиента при приключване на поръчката.', 'box-now-delivery'),
                        'default' => __('Доставка до BOX NOW автомат - достъпни 24/7', 'box-now-delivery'),
                        'desc_tip' => true,
                    ),
                    'costbr1' => array(
                        'title' => __('Стойност на доставката 0 кг. - 3 кг.', 'box-now-delivery'),
                        'type' => 'text',
                        'description' => __('Стойност на доставката 0 кг. - 3 кг.', 'box-now-delivery'),
                        'default' => 0,
                        'desc_tip' => true,
                    ),
                    'costbr2' => array(
                        'title' => __('Стойност на доставката 3 кг. - 6 кг.', 'box-now-delivery'),
                        'type' => 'text',
                        'description' => __('Стойност на доставката 3 кг. - 6 кг.', 'box-now-delivery'),
                        'default' => 0,
                        'desc_tip' => true,
                    ),
                    'costbr3' => array(
                        'title' => __('Стойност на доставката 6 кг. - 10 кг.', 'box-now-delivery'),
                        'type' => 'text',
                        'description' => __('Стойност на доставката 6 кг. - 10 кг.', 'box-now-delivery'),
                        'default' => 0,
                        'desc_tip' => true,
                    ),
                    'costbr4' => array(
                        'title' => __('Стойност на доставката 10 кг. - 20 кг.', 'box-now-delivery'),
                        'type' => 'text',
                        'description' => __('Стойност на доставката 10 кг. - 20 кг.', 'box-now-delivery'),
                        'default' => 0,
                        'desc_tip' => true,
                    ),
                    'free_delivery_threshold' => array(
                        'title' => __('Стойност лимит за безплатна доставка.', 'box-now-delivery'),
                        'type' => 'number',
                        'description' => __('Ако стойността на поръчката е над тази сума, няма да се начисли такса за доставка', 'box-now-delivery'),
                        'default' => '',
                        'desc_tip' => true,
                    ),
                    'taxable' => array(
                        'title' => __('Taxable', 'box-now-delivery'),
                        'type' => 'select',
                        'description' => __('Начисляване на ДДС върху стойността на поръчката?', 'box-now-delivery'),
                        'default' => 'yes',
                        'options' => array(
                            'yes' => __('Да', 'box-now-delivery'),
                            'no' => __('Не', 'box-now-delivery'),
                        ),
                    ),
                    'custom_weight' => array(
                        'title' => __('Максимално допустимо тегло (kg)', 'box-now-delivery'),
                        'type' => 'number',
                        'description' => __('Максимално допустимо тегло (kg)', 'box-now-delivery'),
                        'placeholder' => __('20kg', 'box-now-delivery'),
                        'default' => 20,
                        'desc_tip' => true,
                        'custom_attributes' => array(
                            'step' => '0.1',
                            'min' => '0.1',
                        ),
                    ),
                    'dimensions' => array(
                        'title' => __('Максимални размери на пратката', 'box-now-delivery'),
                        'type' => 'title',
                        'description' => __('Максимални размери на пратката при доставка с BOX NOW', 'box-now-delivery'),
                    ),
                    'max_length' => array(
                        'title' => __('Максимална дължина (cm)', 'box-now-delivery'),
                        'type' => 'number',
                        'description' => __('Максимална дължина на пратката позволена за този метод за доставка (в см.)', 'box-now-delivery'),
                        'placeholder' => __('60 cm', 'box-now-delivery'),
                        'default' => 60,
                        'custom_attributes' => array(),
                    ),
                    'max_width' => array(
                        'title' => __('Максимална широчина (cm)', 'box-now-delivery'),
                        'type' => 'number',
                        'description' => __('Максимална широчина на пратката позволена за този метод за доставка (в см.)', 'box-now-delivery'),
                        'placeholder' => __('45 cm', 'box-now-delivery'),
                        'default' => 45,
                        'custom_attributes' => array(),
                    ),
                    'max_height' => array(
                        'title' => __('Максимална височина (cm)', 'box-now-delivery'),
                        'type' => 'number',
                        'description' => __('Максимална височина на пратката позволена за този метод за доставка (в см.)', 'box-now-delivery'),
                        'placeholder' => __('36 cm', 'box-now-delivery'),
                        'default' => 36,
                        'custom_attributes' => array(),
                    ),
                    'cod_description' => array(
                        'title' => __('Настройване на описанието на "Наложен платеж"', 'box-now-delivery'),
                        'type' => 'title',
                        'description' => __('Промяна на текста в описанието на метод за плащане "Наложен платеж"', 'box-now-delivery'),
                    ),
                    'enable_custom_cod_description' => array(
                        'title' => __('Модифициране на текста за "Наложен платеж"', 'box-now-delivery'),
                        'type' => 'checkbox',
                        'description' => __('Включване / изключване на модифицирането на текста за метод за плащане "Наложен платеж".', 'box-now-delivery'),
                        'default' => 'yes',
                        'class' => 'enable_custom_cod_description',
                    ),
                    'custom_cod_description' => array(
                        'title' => __('Описание на метода Наложен Платеж', 'box-now-delivery'),
                        'type' => 'text',
                        'description' => __('Въведете текст по желание при избран метод за плащане Наложен платеж', 'box-now-delivery'),
                        'default' => 'ВНИМАНИЕ! При доставка до автомат на BOX NOW с "Наложен платеж" няма опция за плащане в брой. Плащането е с банкова карта през линк, който ще получите по SMS/Viber/имейл заедно с потвърждението за изпратената пратка.',
                        'desc_tip' => true,
                        'class' => 'custom_cod_description_field',
                    ),
                );
            }
            /**
             * Calculate the shipping cost.
             *
             * @param array $package Shipping package.
             */
            public function calculate_shipping($package = [])
            {
                // Check if any item in the cart is oversized
                if ($this->has_oversized_products()) {
                    return; // Do not display the Box Now Delivery shipping method if an item is oversized
                }

                // Taxable yes or no
                $taxable = ($this->taxable == 'yes') ? true : false;

                // Get the order total
                $order_total = WC()->cart->get_displayed_subtotal();

                // Adjust total for any coupons
                if (!empty(WC()->cart->get_coupons())) {
                    foreach (WC()->cart->get_coupons() as $code => $coupon) {
                        if ($coupon->is_type('fixed_cart')) {
                            $order_total -= $coupon->get_amount();
                        } else if ($coupon->is_type('percent')) {
                            $order_total -= ($coupon->get_amount() / 100) * $order_total;
                        }
                    }
                }

                // Get the user-defined threshold for free delivery
                $free_delivery_threshold = $this->get_option('free_delivery_threshold');

                // Check if the order total is above the threshold for free delivery
                if (!empty($free_delivery_threshold) && $order_total >= $free_delivery_threshold) {
                    $this->cost = 0.00;
                } else {
                    // Check weight of parcel
                    $parcel_weight = $this->get_cart_weight();

                    //  Convert option values to numeric types
                    $costbr1 = (float) $this->get_option('costbr1');
                    $costbr2 = (float) $this->get_option('costbr2');
                    $costbr3 = (float) $this->get_option('costbr3');
                    $costbr4 = (float) $this->get_option('costbr4');

                    // Determine the shipping cost based on weight ranges
                    if ($parcel_weight <= 3) {
                        $this->cost = $costbr1;
                    } elseif ($parcel_weight <= 6) {
                        $this->cost = $costbr2;
                    } elseif ($parcel_weight <= 10) {
                        $this->cost = $costbr3;
                    } elseif ($parcel_weight <= 20) {
                        $this->cost = $costbr4;
                    }

                    // Perform additional calculations or adjustments if needed

                    // Example: Add 10% tax if taxable
                    if ($taxable) {
                        $this->cost *= 1.10;
                    }
                }
                //Check weight of parcel
                // TO DO

                $rate = [
                    'id' => $this->id,
                    'label' => $this->title,
                    'cost' => $this->cost,
                    'taxes' => $taxable ? WC_Tax::calc_shipping_tax($this->cost, WC_Tax::get_shipping_tax_rates()) : '',
                    'calc_tax' => 'per_item',
                ];

                // Register the rate.
                $this->add_rate($rate);
            }

            /**
             * Get the total weight of items in the cart.
             *
             * @return float
             */
            private function get_cart_weight()
            {
                $cart_weight = 0;

                foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
                    $product = $cart_item['data'];
                    $weight = $product->get_weight();
                    $quantity = $cart_item['quantity'];
                    $cart_weight += is_numeric($weight) ? floatval($weight) * $quantity : 0;
                }

                return $cart_weight;
            }

            /**
             * Checks if the cart contains any oversized products or if the total weight exceeds the custom weight limit.
             *
             * @return bool Returns true if the cart contains oversized products or if the total weight exceeds the custom weight limit, otherwise returns false.
             */
            private function has_oversized_products()
            {
                $custom_weight_limit = floatval($this->settings['custom_weight']);
                $oversized = false;

                // Loop through each item in the cart
                foreach (WC()->cart->get_cart_contents() as $cart_item) {
                    $length = $cart_item['data']->get_length();
                    $width = $cart_item['data']->get_width();
                    $height = $cart_item['data']->get_height();

                    // Handle the weight calculation
                    $weight = $cart_item['data']->get_weight();
                    //If no weight default to 1 kg.
                    $weight = is_numeric($weight) ? floatval($weight) : 1; // TO DO: $default_weight = floatval($this->settings['default_weight']);

                    if ($length > $this->settings['max_length'] || $width > $this->settings['max_width'] || $height > $this->settings['max_height'] || $weight > $custom_weight_limit) {
                        $oversized = true;
                        break;
                    }
                }
                // Return true if any product has oversized dimensions or if any individual item's weight exceeds the custom weight limit
                return $oversized;
            }
        }
    }
}

// Modify the Cash on Delivery payment method's description based on the shipping zone
add_filter('woocommerce_gateway_description', 'boxnow_change_cod_description', 10, 2);
function boxnow_change_cod_description($description, $payment_id)
{
    if ('cod' !== $payment_id) {
        return $description;
    }

    // Get the chosen shipping methods from the current customer's session
    $chosen_shipping_methods = WC()->session->get('chosen_shipping_methods');

    // Only modify the description if the chosen shipping method is 'box_now_delivery'
    if (is_array($chosen_shipping_methods) && in_array('box_now_delivery', $chosen_shipping_methods)) {
        // Get the current customer's package
        $package = array();
        if (WC()->customer) {
            $package = array(
                'destination' => array(
                    'country' => WC()->customer->get_shipping_country(),
                    'state' => WC()->customer->get_shipping_state(),
                    'postcode' => WC()->customer->get_shipping_postcode(),
                ),
            );
        }

        // Get the shipping zone matching the customer's package
        $shipping_zone = WC_Shipping_Zones::get_zone_matching_package($package);

        // Now you can access the shipping methods of the shipping zone
        $shipping_methods = $shipping_zone->get_shipping_methods();

        foreach ($shipping_methods as $instance_id => $shipping_method) {
            if ('box_now_delivery' === $shipping_method->id) {
                $enable_custom_cod_description = $shipping_method->get_option('enable_custom_cod_description');
                $custom_cod_description = $shipping_method->get_option('custom_cod_description');

                if ('yes' === $enable_custom_cod_description && !empty($custom_cod_description)) {
                    return $custom_cod_description;
                }
            }
        }
    }

    return $description;
}

// Refresh the checkout page when the payment method changes

add_action('woocommerce_review_order_before_payment', 'boxnow_add_cod_payment_refresh_script');

function boxnow_add_cod_payment_refresh_script()
{
?>
    <script>
        jQuery(document).ready(function($) {
            // Store the APM address when the payment method changes
            $(document.body).on('change', 'input[name="payment_method"]', function(event) {
                // Prevent the default action of the event
                event.preventDefault();
                event.stopPropagation();
            });
        });
    </script>
<?php
}


// Add the custom shipping method to WooCommerce
add_filter('woocommerce_shipping_methods', 'boxnow_add_box_now_delivery_shipping_method');

/**
 * Add the custom shipping method to WooCommerce.
 *
 * @param array $methods Existing shipping methods.
 * @return array Updated shipping methods.
 */
function boxnow_add_box_now_delivery_shipping_method($methods)
{
    $methods['box_now_delivery'] = 'Box_Now_Delivery_Shipping_Method';
    return $methods;
}
