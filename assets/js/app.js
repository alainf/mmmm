/* global $ */
'use strict'

$(function () {
  $(document).foundation()

  $('a').on('click', function (ev) {
    console.log('this', this)
    console.log('ev', ev)
  })
})
