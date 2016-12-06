/* global $ */
'use strict'

$(function () {
  $(document).foundation()

  // deep links
  if (window.location.hash) {
    var $tabs = $('[data-tabs]')
    if ($tabs) {
      $tabs.foundation('selectTab', window.location.hash)
    }
  }
})
