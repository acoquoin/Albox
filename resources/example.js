//Albox.config({skin:'jvfr'});
$(document).ready(function(){
    $('code').each(function(){
        $(this).html($(this).html().replace(/\\t/g, '<s>'));
    });
    $('a').live('click', function(event){
        event.preventDefault();
        if(/\#section\:(.+)/gi.test($(this).attr('href'))){
            $('html, body').animate({'scrollTop' : $('a[name="' + $(this).attr('href').replace('#', '') + '"]').offset().top}, 400);
        }
        switch($(this).attr('class')){
            case 'albox-ex1' :
                $.albox({title:'Exemple 1', content:'<center>Texte de confirmation</center>'});
                break;
            case 'albox-ex2' :
                $.albox({title:'Exemple 2', url:'http://www.perdu.com/', speed: 1E3});
                break;
            case 'albox-ex3' :
                $.albox({title:'Exemple 3', content:'<center>Regardez en haut à droite du titre.<br />Cliquez sur l\'overlay pour femer la fenêtre.</center><center><a href="javascript:;" onclick="$.albox.stopLoading();$(this).remove();" class="link-button">Stopper le chargement</a></center>', afterShow : function(){ $.albox.startLoading(); }});
                break;
            case 'albox-ex4' :
                $.albox({title:'Exemple 4', content:'<center>Laissez cliquez sur le titre de la albox pour pouvoir la déplacer.<br />Relachez pour sauvegarder la position</center>', draggable : true});
                break;
            case 'albox-ex5' :
                $.albox({title:'Exemple 5', content:'<center>Regardez en bas à droite ;).</center>', resizable : true});
                break;
            case 'albox-ex6' :
                $.albox({title:'Exemple 6', content:'<center>Je suis le skin de jeuxvideo.fr ! :D</center>', skin:'jvfr'});
                break;
            case 'albox-ex7' :
                $.albox({title:'Exemple 7', content:'<center>Impossible de fermer cettre fenêtre ?<br /> Le seul moyen est ici :<br /><br /><a href="javascript:;" onclick="$.albox.close();" class="link-button">Fermer la fenêtre</a></center>', close : false, closeOverlay : false});
                break;
            case 'albox-ex8' :
                $.albox({title:'Exemple 8', content:'<center>What else ?</center>', afterShow : function(){ alert('Callback afterShow appelé !');}});
                break;
            case 'albox-ex9' :
                $.albox({title:'Exemple 9', content:'<center>What else ?</center>', beforeLoad : function(){ alert('Callback beforeLoad appelé !');}});
                break;
            case 'albox-ex10' :
                $.albox({title:'Exemple 10', content:'<center>What else ?</center>', afterLoad : function(){ alert('Callback afterLoad appelé !');}});
                break;
            case 'albox-ex11' :
                $.albox({title:'Exemple 11', content:'<center>Fermer la fenêtre pour appeler le callback</center>', beforeClose : function(){ alert('Callback beforeClose appelé !');}});
                break;
            case 'albox-ex12' :
                $.albox({title:'Exemple 12', content:'<center>Fermer la fenêtre pour appeler le callback</center>', afterClose : function(){ alert('Callback afterClose appelé !');}});
                break;
            case 'albox-ex13' :
                $.albox({title:'Exemple 13', content:'<center>What else ?</center>', beforePos : function(redraw){ alert('Callback beforePos appelé !\n\nwidth:' + redraw.width + '\nheight:' + redraw.height);}});
                break;
            case 'albox-ex14' :
                $.albox({title:'Exemple 14', content:'<center>What else ?</center>', afterPos : function(redraw){ alert('Callback afterPos appelé !\n\nwidth:' + redraw.width + '\nheight:' + redraw.height);}});
                break;
            case 'albox-ex15' :
                $.albox({
                    title:'Exemple 15',
                    content:'<center>Texte contenu dans ma albox</center>',
                    button : {
                        button1 : {
                            text : 'Alerter',
                            call : function(){
                                alert('Callback du bouton "Alerter" appelé !');
                            }
                        },
                        button2 : {
                            text : 'Fermer',
                            className : 'grey',
                            call : function(){
                                $.albox.close();
                            }
                        }
                    }
                });
                break;
            case 'albox-ex16' :
                $.albox({
                    title : 'Exemple 16 - Fenêtre A',
                    content : '<center>Contenu : <span>aucun</span><br /><br /><a href="#" onclick="javascript:$.albox.call().box();">Changer le contenu</a></center>',
                    callbacks : {
                        box : function(){
                            $.albox({
                                title : 'Exemple 16 - Fenêtre B',
                                content : '<center><a href="#" onclick="$.albox.call().changeContent();">Mise à jour du contenu de A</a></center>',
                                callbacks : {
                                    changeContent : function(){
                                        $.albox.parent().$content.find('span').html('Contenu provenant de la fenêtre B<br /><br /><strong>' + new Date() + '</strong>');
                                        $.albox.close(function(){
                                            $.albox.position();
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
                break;
            case 'albox-ex17' :
                $.albox({
                    title: 'Exemple #17',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis odio nisl, id interdum nunc.',
                    url: '1.jpg'
                }, 'image');
                break;
            case 'albox-ex18' :
                $.albox({
                    title: 'Exemple #18',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis odio nisl, id interdum nunc.',
                    url: '1.jpg',
                    zoom: false
                }, 'image');
                break;
            case 'albox-ex21' :
                $.albox({
                    url: 'http://www.deco.fr',
                    title: 'Exemple 21'
                });
                break;
            case 'albox-ex22' :
                $.albox({
                    title: 'Exemple 22'
                });
                break;
            case 'albox-ex23' :
                $.albox({
                    url:'#albox-ex23',
                    title:'Exemple 23'
                });
                break;
            case 'albox-ex24' :
                $.albox({
                    url: 'resources/steps.html',
                    title: 'Steps : ',
                    overlay: .7,
                    width: 480,
                    current: 'step_1',
                    steps: {
                        step_1: 'Etape #1',
                        step_2: 'Etape #2',
                        step_3: 'Etape #3'
                    },
                    afterStepLoad: function(name, index) {
                        console.info('[afterStepLoad] name: ' + name + ', index: ' + index);
                    },
                    beforePrevStep: function(name, index) {
                        console.info('[beforePrevStep] name: ' + name + ', index: ' + index);
                    },
                    beforeNextStep: function(name, index) {
                        console.info('[beforeNextStep] name: ' + name + ', index: ' + index);
                    }
                });
                break;
            case 'albox-ex25' :
                $.albox({
                    url: 'resources/ajax.html',
                    title: 'Exemple #25'
                });
                break;
            case 'albox-ex26' :
                $.albox({
                    url: 'resources/aaaaaaaaaaaaa.html',
                    title: 'Exemple #26'
                });
                break;
            default:
                break;
        }
    });
});
