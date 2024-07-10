<?php
/**
 * convert functions for records from/to json (array) format
 *
 * @package     Inventory
 * @subpackage  Convert
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Ching En Cheng <c.cheng@metaways.de>
 * @copyright   Copyright (c) 2024 Metaways Infosystems GmbH (http://www.metaways.de)
 */

/**
 * convert functions for records from/to json (array) format
 *
 * @package     Inventory
 * @subpackage  Convert
 */
class Inventory_Convert_InventoryItem_Json extends Tinebase_Convert_Json
{

    /**
     * resolves child records after converting the record set to an array
     *
     * @param array $result
     * @param Tinebase_ModelConfiguration $modelConfiguration
     * @param boolean $multiple
     *
     * @return array
     */
    protected function _resolveAfterToArray($result, $modelConfiguration, $multiple = false)
    {
        $result = parent::_resolveAfterToArray($result, $modelConfiguration, $multiple);
        $result = $multiple ? $result : [$result];
        foreach ($result as &$record) {
            if (empty($record['invoice'])) {
                continue;
            }
            $invoice = Sales_Controller_PurchaseInvoice::getInstance()->get($record['invoice']['id'])->toArray();
            if (isset($invoice['supplier'][0])) {
                $invoice['supplier'] = $invoice['supplier'][0];
                $record['invoice'] = $invoice;
            }
        }
        return $multiple ? $result : $result[0];
    }
}
