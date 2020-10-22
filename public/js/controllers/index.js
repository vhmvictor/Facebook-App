let datatable;
let initKtDatatable = function(url) {
    console.log(url)
    datatable = $('#kt_datatable').KTDatatable({
        data: {
            type: 'remote',
            source: {
              read: {
                url: url,
                method: 'GET',
              },
            },
            pageSize: 10,
            serverPaging: false,
            serverFiltering: false,
            serverSorting: false,
        },
        layout: {
            scroll: false,
            footer: false 
        },
        sortable: true,
        pagination: true,
        columns: [{
            field: 'id',
            title: '#',
            sortable: false,
            width: 20,
            selector: {
                class: ''
            },
            textAlign: 'center',
        }, {
            field: 'name',
            title: 'Interesse',
            textAlign: 'left',
            width: 230,
        }, {
            field: 'audience_size',
            title: 'Tamanho da Audiência',
            width: 300,
            template: function(row) {
                return '\
                    <div class="skills" style="width: '+ row.audience_size/1000000 + '%"></div>\
                    <small style="font-weight: 900">' + (row.audience_size).toLocaleString('pt-BR') + '</small>\
                ';
            }
        }, {
            field: 'topic',
            title: 'Tópico',
            width: 200,
            textAlign: 'left',
        }, {
            field: 'Actions',
            title: '',
            sortable: false,
            width: 125,
            overflow: 'visible',
            textAlign: 'center',
	        autoHide: false,
            template: function(row) {
                return '\
                    <div class="dropdown dropdown-inline">\
                        <span><i id="copy_button" value ="'+row.name+'"class="fa fa-copy" style="cursor: pointer; color: rgb(140, 141, 141);"></i></span>\
                        <a href="https://www.google.com.br/search?source=hp&ei=HCOQX-C-O9G95OUP99ma8AE&q=' + row.name + '" target="_blank">\
                            <i class="fa fa-google" style="font-size:18px;color:black;cursor: pointer;"></i>\
                        </a>\
                        <a href="https://web.facebook.com/search/top/?q=' + row.name + '" target="_blank">\
                            <i class="fa fa-facebook" style="font-size:18px;color:#4267B2;cursor: pointer;"></i>\
                        </a>\
                    </div>\
                ';
            },
        }],
    });
    datatable.on(
        'datatable-on-check datatable-on-uncheck',
        function(e) {
            var checkedNodes = datatable.rows('.datatable-row-active').nodes();
            var count = checkedNodes.length;
            $('#kt_datatable_selected_records').html(count);
            if (count > 0) {
                $('#kt_datatable_group_action_form').collapse('show');
            } else {
                $('#kt_datatable_group_action_form').collapse('hide');
            }
        });
    //
    $(document).on('click', '#copy_button', function(){
        let name = $(this).attr('value');
        let el = document.createElement('textarea');
        el.value = name;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        swal.fire({
            icon: 'success',
            text: JSON.stringify(name) + " copiado",
        });
    });
    $('#kt_datatable_fetch_modal').on('show.bs.modal', function(e) {
        var selected_name = datatable.rows('.datatable-row-active').nodes();
        var ids = datatable.rows('.datatable-row-active').
        nodes().
        find('.checkbox > [type="checkbox"]').
        map(function(i, chk) {
            return $(chk).val();
        });
        var c = document.createDocumentFragment();
        for (var i = 0; i < ids.length; i++) {
            var li = document.createElement('li');
            li.setAttribute('data-id', ids[i]);
            li.innerHTML = "<div style='margin-bottom: 10px'>" + selected_name[i].childNodes[1].innerText + "</div>";
            c.appendChild(li);
        }
        $('#kt_datatable_fetch_display').append(c);
    }).on('hide.bs.modal', function(e) {
        $('#kt_datatable_fetch_display').empty();
    });
};
//
$(document).ready(function() {
    $('#kt_datatable_search').collapse('show');
    $('#search_button').on('click', async function() {
        $('#kt_datatable_search').collapse('hide');
        try {
            $('#kt_datatable_search_query').prop('disabled', true);
            let search_input = $('#kt_datatable_search_query').val()
            let authorization = (await axios.get("https://graph.facebook.com/oauth/access_token?client_id=1785979331549869&client_secret=7d7b46a060e5679edc109d48ef992813&grant_type=client_credentials")).data;
            let interesses_url = "https://graph.facebook.com/search?type=adinterest&q=[" + search_input + "]&limit=10000&locale=pt_BR&access_token=" + authorization.access_token + "";
            let count = (await axios.get(interesses_url)).data;
            if (count.data) {
                $('#kt_datatable_search_reflash').collapse('show');
                $('#search_result').html(count.data.length + " Interesses Encontrados!");
                if (count.data.length > 0) {
                    $('#kt_datatable_selected_results').collapse('show');
                } else {
                    $('#kt_datatable_selected_results').collapse('hide');
                };
                initKtDatatable(interesses_url);
                $('#reflash_button').on('click', function() {
                    window.location.reload();
                });
            };
        } catch (e) {
            console.log(e);
        };
    });
});
