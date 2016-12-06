/* global $ */
'use strict'

$(function () {
  $(document).foundation()

  // deep links
  if (window.location.hash) {
    var $dest = $(window.location.hash)
    var $tabs = $('[data-tabs]')
    if ($dest && $tabs) {
      $tabs.foundation('selectTab', $dest)
    }
  }
})
