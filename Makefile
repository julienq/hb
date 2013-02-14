CP = cp -f
RM = rm -rf
GIT_GET = git clone --depth 1
MKDIR = mkdir -p

LIBSDIR = libs
BENDER = $(LIBSDIR)/bender
GESTURE = $(LIBSDIR)/gesture

BENDER_URL = https://github.com/bendr/bender.git
GESTURE_URL = https://github.com/dthevenin/Gesture.git

extern:	libs/flexo.js libs/pointer.js

$(LIBSDIR):
	$(MKDIR) $(LIBSDIR)

libs/flexo.js:	$(LIBSDIR)
	cd $(LIBSDIR); $(GIT_GET) -b uninstance $(BENDER_URL)
	$(CP) $(BENDER)/flexo.js $@

libs/pointer.js: $(LIBSDIR)
	cd $(LIBSDIR); $(GIT_GET) $(GESTURE_URL)
	$(CP) $(GESTURE)/build/vs_pointer_standalone.js $@

realclean:
	$(RM) $(LIBSDIR)
